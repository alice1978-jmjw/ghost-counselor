import { z } from "zod";

export const GhostResponseSchema = z.object({
  ghost_dialogue: z.string().describe("The brutal reality check dialogue"),
  slang_used: z.boolean().describe("True if Gen-Z slang was injected"),
  ego_damage_score: z.number().min(1).max(100).describe("Integer to deduct from user health bar"),
  next_game_phase: z.enum(["sorting", "assessment", "game_over"]),
  suggested_action: z.string().nullable().optional()
});
