"use client";

import type { PropsWithChildren } from 'react';
import { Reshaped } from 'reshaped';

import 'reshaped/themes/slate/theme.css';

export const ReshapedProvider = ({ children }: PropsWithChildren) => {
  return <Reshaped theme="slate">{children}</Reshaped>;
};
