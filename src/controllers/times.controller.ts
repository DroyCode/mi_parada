import { Request, Response } from 'express';
import { Time, ITime } from '../models/time.model';
import { Stop } from '../models/stop.model';
import { Syndicate } from '../models/syndicate.model';


export async function listTimes(req: Request, res: Response) {
  const items = await Time.find().populate('stop').populate('syndicate').lean();
  return res.json(items);
}


export async function getTime(req: Request<{ id: string }>, res: Response) {
  const { id } = req.params;
  const item = await Time.findById(id).populate('stop').populate('syndicate');
  if (!item) return res.status(404).json({ message: 'Not found' });
  return res.json(item);
}


export async function createTime(
  req: Request<
    {},
    unknown,
    Partial<Pick<ITime, 'stop' | 'syndicate' | 'transportName' | 'transportType' | 'arrivalTime' | 'notes'>>
  >,
  res: Response
) {
  const { stop, syndicate, transportName, transportType, arrivalTime, notes } = req.body;

  if (!stop) return res.status(400).json({ message: 'stop is required' });
  if (!transportName || typeof transportName !== 'string') return res.status(400).json({ message: 'transportName is required' });
  if (transportType === undefined || transportType === null) return res.status(400).json({ message: 'transportType is required' });
  if (!arrivalTime) return res.status(400).json({ message: 'arrivalTime is required' });

  // Validar existencia de stop y syndicate
  const stopExists = await Stop.findById(stop);
  if (!stopExists) return res.status(400).json({ message: 'stop does not exist' });

  if (syndicate) {
    const syndExists = await Syndicate.findById(syndicate);
    if (!syndExists) return res.status(400).json({ message: 'syndicate does not exist' });
  }

 
  const arrival =
    arrivalTime instanceof Date
      ? arrivalTime
      : new Date(arrivalTime as unknown as string);

  if (Number.isNaN(arrival.getTime())) {
    return res.status(400).json({ message: 'arrivalTime is invalid' });
  }

  const created = await Time.create({
    stop,
    syndicate,
    transportName: transportName.trim(),
    transportType,
    arrivalTime: arrival,
    notes,
  });

  return res.status(201).json(created);
}


export async function updateTime(
  req: Request<
    { id: string },
    unknown,
    Partial<Pick<ITime, 'stop' | 'syndicate' | 'transportName' | 'transportType' | 'arrivalTime' | 'notes'>>
  >,
  res: Response
) {
  const { id } = req.params;
  const updates = req.body;

  if (updates.stop) {
    const stopExists = await Stop.findById(updates.stop);
    if (!stopExists) return res.status(400).json({ message: 'stop does not exist' });
  }

  if (updates.syndicate) {
    const syndExists = await Syndicate.findById(updates.syndicate);
    if (!syndExists) return res.status(400).json({ message: 'syndicate does not exist' });
  }

  if (updates.arrivalTime) {
    const arrival =
      updates.arrivalTime instanceof Date
        ? updates.arrivalTime
        : new Date(updates.arrivalTime as unknown as string);

    if (Number.isNaN(arrival.getTime())) {
      return res.status(400).json({ message: 'arrivalTime is invalid' });
    }

    (updates as any).arrivalTime = arrival;
  }

  if (updates.transportName && typeof updates.transportName === 'string') {
    (updates as any).transportName = updates.transportName.trim();
  }

  const item = await Time.findByIdAndUpdate(id, updates, { new: true })
    .populate('stop')
    .populate('syndicate');

  if (!item) return res.status(404).json({ message: 'Not found' });
  return res.json(item);
}


export async function deleteTime(req: Request<{ id: string }>, res: Response) {
  const { id } = req.params;
  await Time.findByIdAndDelete(id);
  return res.status(204).send();
}
