export const getPasswordStrength = (pass: string) => {
  let score = 0;
  if (!pass) return { score: 0, label: "", color: "bg-neutral-200", text: "text-neutral-400" };
  if (pass.length >= 6) score += 1;
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500", text: "text-red-500" };
  if (score === 2) return { score: 2, label: "Fair", color: "bg-orange-500", text: "text-orange-500" };
  if (score === 3) return { score: 3, label: "Good", color: "bg-yellow-500", text: "text-yellow-500" };
  return { score: 4, label: "Strong", color: "bg-green-500", text: "text-green-500" };
};
