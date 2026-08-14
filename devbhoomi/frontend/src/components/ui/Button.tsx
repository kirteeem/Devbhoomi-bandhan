import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "gold" | "ghost";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const variantClass: Record<Variant, string> = {
  primary: "btn-primary",
  gold: "btn-gold",
  ghost: "btn-ghost",
};

export const Button = ({ variant = "primary", className = "", children, ...rest }: Props) => (
  <button className={`${variantClass[variant]} ${className}`} {...rest}>
    {children}
  </button>
);
