import { Request, Response } from 'express';
import { Stop, IStop } from '../models/stop.model';


export async function listStops(req: Request, res: Response) {
  const stops = await Stop.find().lean();
  return res.json(stops);
}


export async function getStop(req: Request<{ id: string }>, res: Response) {
  const { id } = req.params;
  const stop = await Stop.findById(id);
  if (!stop) return res.status(404).json({ message: 'Not found' });
  return res.json(stop);
}


export async function createStop(
  req: Request<{}, unknown, Partial<Pick<IStop, 'name' | 'location' | 'address'>>>,
  res: Response
) {
  const body = req.body;
  if (!body || !body.name) {
    return res.status(400).json({ message: 'name is required' });
  }

  const stop = await Stop.create({
    name: body.name,
    location: body.location,
    address: body.address,
  });
  return res.status(201).json(stop);
}


export async function updateStop(
  req: Request<{ id: string }, unknown, Partial<Pick<IStop, 'name' | 'location' | 'address'>>>,
  res: Response
) {
  const { id } = req.params;
  const updates = req.body;
  const stop = await Stop.findByIdAndUpdate(id, updates, { new: true });
  if (!stop) return res.status(404).json({ message: 'Not found' });
  return res.json(stop);
}


export async function deleteStop(req: Request<{ id: string }>, res: Response) {
  const { id } = req.params;
  await Stop.findByIdAndDelete(id);
  return res.status(204).send();
}
