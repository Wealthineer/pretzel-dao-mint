'use client';

import {motion} from "framer-motion";
import { textContainer, textVariant2 } from "@/utils/motion";
import React from "react";

type TypingTextProps = {
  title: string,
  textStyles?: string
}

type TitleTextProps = {
  title: React.ReactNode,
  textStyles?: string
}

export const TypingText = ({title, textStyles}:TypingTextProps) => (
  <motion.p
  variants={textContainer}
  className={`text-[16px] font-extrabold text-secondary-white ${textStyles}`}>
    {Array.from(title).map((letter, index) => (
      <motion.span variants={textVariant2} key={index}> 
        {letter===' ' ? '\u00A0' : letter}
      </motion.span>
    ))}
  </motion.p>
);

export const TitleText = ({title, textStyles}:TitleTextProps) => (
  <motion.h2
    variants={textVariant2}
    initial="hidden"
    whileInView="show"
    className={`mt-[8px] font-bold text-[40px] text-white ${textStyles}`}>
    {title}

  </motion.h2>
);
