import { z } from 'zod';

export const topicRefDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  color: z.string().nullable(),
  icon: z.string().nullable(),
});
export type TopicRefDto = z.infer<typeof topicRefDtoSchema>;

export const topicDtoSchema = topicRefDtoSchema.extend({
  description: z.string(),
  courseCount: z.number(),
});
export type TopicDto = z.infer<typeof topicDtoSchema>;
