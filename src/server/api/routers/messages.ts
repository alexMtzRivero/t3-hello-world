import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";

export const messagesRouter = createTRPCRouter({
  postMessage: publicProcedure
    .input(
      z.object({
        text: z
          .string()
          .min(1, "The message should contain at least 1 character"),
      })
    )
    .mutation(({ ctx, input }) => {
      const message = ctx.prisma.message.create({
        data: {
          text: input.text,
          userId: ctx.session?.user?.id,
        },
      });
      return message;
    }),

  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.message.findMany({
      select: {
        id: true,
        text: true,
        createdAt: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });
  }),

  freeDelete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.message.deleteMany({
        where: {
          id: input.id,
          userId: ctx.session?.user?.id,
        },
      });
    }),

  messageDelete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const message = await ctx.prisma.message.findUnique({
        where: {
          id: input.id,
        },
      });
      const userDeletesHisMessage = message?.userId == ctx.session?.user?.id;
      if (!userDeletesHisMessage) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your messages",
        });
      }
      return ctx.prisma.message.deleteMany({
        where: {
          id: input.id,
        },
      });
    }),
});
