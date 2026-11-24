import { z } from "zod";

export const GhostResponseSchema = z.object({
  ghost_dialogue: z.string().describe("The brutal reality check dialogue"),
  slang_used: z.boolean().describe("True if Gen-Z slang was injected"),
  ego_damage_score: z.number().min(1).max(100).describe("Integer to deduct from user health bar"),
  next_game_phase: z.enum(["sorting", "assessment", "game_over"]),
  suggested_action: z.string().nullable().optional()
});

export const CustomTarotCardSchema = z.object({
  arcanaNumber: z.string().min(1).max(12).optional(),
  arcanaTitle: z.string().min(2).max(80),
  careerTitle: z.string().min(3).max(120),
  salaryRange: z.string().min(3).max(60),
  growthOutlook: z.string().min(3).max(60),
  whyItFits: z.string().min(10).max(500),
  shadowProtection: z.string().min(10).max(500),
  first90Days: z.array(z.string().min(5).max(300)).min(2).max(4)
});
