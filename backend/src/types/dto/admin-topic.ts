import { z } from 'zod';
import { topicRefDtoSchema } from './topic';
import { TOPIC_ICON_KEYS, TOPIC_COLOR_REGEX } from '../constants';

export const adminTopicDtoSchema = topicRefDtoSchema.extend({
  description: z.string(),
  isActive: z.boolean(),
  displayOrder: z.number(),
  courseCount: z.number(),
  createdAt: z.string(),
});
export type AdminTopicDto = z.infer<typeof adminTopicDtoSchema>;

export const createTopicReqSchema = z.object({
  name: z.string().trim().min(1, 'Tên chủ đề không được để trống').max(100, 'Tên chủ đề tối đa 100 ký tự'),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug chỉ gồm chữ thường không dấu, số và dấu gạch nối')
    .max(100)
    .optional(),
  description: z.string().default(''),
  color: z
    .string()
    .regex(TOPIC_COLOR_REGEX, 'Màu phải ở định dạng #RRGGBB')
    .nullable()
    .optional(),
  icon: z.enum(TOPIC_ICON_KEYS).nullable().optional(),
  isActive: z.boolean().default(true),
});
export type CreateTopicReq = z.infer<typeof createTopicReqSchema>;

export const updateTopicReqSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().optional(),
  color: z
    .string()
    .regex(TOPIC_COLOR_REGEX, 'Màu phải ở định dạng #RRGGBB')
    .nullable()
    .optional(),
  icon: z.enum(TOPIC_ICON_KEYS).nullable().optional(),
  isActive: z.boolean().optional(),
});
export type UpdateTopicReq = z.infer<typeof updateTopicReqSchema>;

export const reorderTopicsReqSchema = z.object({
  orderedIds: z.array(z.string()),
});
export type ReorderTopicsReq = z.infer<typeof reorderTopicsReqSchema>;
