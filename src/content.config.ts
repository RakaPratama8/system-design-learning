import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const lessons = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/lessons' }),
  schema: z.object({
    title: z.string(),
    level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    order: z.number(),
    summary: z.string(),
    poke: z.boolean().optional(),
  }),
});

export const collections = { lessons };
