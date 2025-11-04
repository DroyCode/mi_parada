import { Request, Response } from 'express';
import { Syndicate, ISyndicate } from '../models/syndicate.model';


export async function listSyndicates(req: Request, res: Response) {
  const items = await Syndicate.find().lean();
  return res.json(items);
}


export async function getSyndicate(req: Request<{ id: string }>, res: Response) {
  const { id } = req.params;
  const item = await Syndicate.findById(id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  return res.json(item);
}


export async function createSyndicate(
  req: Request<{}, unknown, Partial<Pick<ISyndicate, 'name' | 'contact'>>>,
  res: Response
) {
  const { name, contact } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ message: 'name is required and must be a non-empty string' });
  }

  const created = await Syndicate.create({ name: name.trim(), contact });
  return res.status(201).json(created);
}


export async function updateSyndicate(
  req: Request<{ id: string }, unknown, Partial<Pick<ISyndicate, 'name' | 'contact'>>>,
  res: Response
) {
  const { id } = req.params;
  const updates = req.body;

  if (updates.name && (typeof updates.name !== 'string' || updates.name.trim().length === 0)) {
    return res.status(400).json({ message: 'name must be a non-empty string' });
  }

  const item = await Syndicate.findByIdAndUpdate(
    id,
    { ...updates, ...(updates.name ? { name: (updates.name as string).trim() } : {}) },
    { new: true }
  );

  if (!item) return res.status(404).json({ message: 'Not found' });
  return res.json(item);
}


export async function deleteSyndicate(req: Request<{ id: string }>, res: Response) {
  const { id } = req.params;
  await Syndicate.findByIdAndDelete(id);
  return res.status(204).send();
}
