"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const travellerSignupSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().email("Enter a valid email address").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function signupTraveller(formData: FormData) {
  const parsed = travellerSignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(`/signup?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Invalid details")}`);
  }

  const existingUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existingUser) {
    redirect(`/signup?error=${encodeURIComponent("An account with this email already exists")}`);
  }

  const travellerRole = await prisma.role.findUnique({ where: { key: "traveller" } });
  if (!travellerRole) {
    redirect(`/signup?error=${encodeURIComponent("Registration is temporarily unavailable")}`);
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      customerProfile: {
        create: {
          fullName: parsed.data.name,
          email: parsed.data.email,
        },
      },
    },
  });

  await prisma.userRole.create({
    data: { userId: user.id, roleId: travellerRole.id },
  });

  redirect(`/login?created=1&email=${encodeURIComponent(parsed.data.email)}`);
}
