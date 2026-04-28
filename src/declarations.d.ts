declare module 'react-katex' {
  import type { ReactNode } from 'react';

  interface KatexProps {
    math: string;
    block?: boolean;
    errorColor?: string;
    renderError?: (error: Error) => ReactNode;
    settings?: Record<string, unknown>;
    children?: never;
  }

  export function InlineMath(props: KatexProps): JSX.Element;
  export function BlockMath(props: KatexProps): JSX.Element;
}
