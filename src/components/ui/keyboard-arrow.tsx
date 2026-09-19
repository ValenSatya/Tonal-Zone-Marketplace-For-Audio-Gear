import React from "react";

export interface KeyboardArrowRightProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  strokeWidth?: number;
}

export function KeyboardArrowRight({
  className = "w-4 h-4",
  size,
  strokeWidth = 2.5,
  ...props
}: KeyboardArrowRightProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function KeyboardArrowDown({
  className = "w-4 h-4",
  size,
  strokeWidth = 2.5,
  ...props
}: KeyboardArrowRightProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function KeyboardArrowUp({
  className = "w-4 h-4",
  size,
  strokeWidth = 2.5,
  ...props
}: KeyboardArrowRightProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

export { KeyboardArrowRight as ChevronRight };
export default KeyboardArrowRight;
