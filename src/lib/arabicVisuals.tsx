import React from 'react';
import studentWalkingImg from '../assets/images/student_walking_1787845710964.jpg';
import studentSportsImg from '../assets/images/student_sports_1787845728934.jpg';
import schoolBuildingImg from '../assets/images/school_building_1787845746679.jpg';
import walkingFeetImg from '../assets/images/walking_feet_1787845761678.jpg';

const ImgIcon = ({ src }: { src: string }) => (
  <img src={src} className="w-12 h-12 object-cover rounded-md shadow-sm mix-blend-multiply" alt="Visual representation" />
);

export const arabicVisualDictionary: Record<string, React.ReactNode> = {
  // Rich AI Image overrides requested by the user
  'طلاب': <ImgIcon src={studentSportsImg} />,
  'رياضة': <ImgIcon src={studentSportsImg} />, 
  'مدرسة': <ImgIcon src={schoolBuildingImg} />, 
  'يذهب': <ImgIcon src={studentWalkingImg} />, 
  'اذهب': <ImgIcon src={studentWalkingImg} />, 
  'تذهب': <ImgIcon src={studentWalkingImg} />, 
  'نذهب': <ImgIcon src={studentWalkingImg} />, 
  'ذهاب': <ImgIcon src={studentWalkingImg} />,
  'مشي': <ImgIcon src={walkingFeetImg} />, 
  'اقدام': <ImgIcon src={walkingFeetImg} />,
};

export function removeHarakat(text: string) {
  return text.replace(/[\u0617-\u061A\u064B-\u0652]/g, '');
}

export function getVisualsForText(text: string) {
  if (!text) return [];
  
  const words = text.split(/[\s\n،.؛?؟]+/);
  
  return words.map(word => {
    if (!word.trim()) return null;
    
    let cleanWord = removeHarakat(word.trim());
    
    // TYPO CORRECTION / SMART AI NORMALIZATION
    const typoCorrections: Record<string, string> = {
      'ادهب': 'اذهب',
      'المدرشة': 'مدرسة',
      'مدرشة': 'مدرسة',
      'بالمسيا': 'مشي',
      'مسيا': 'مشي',
      'الاقدام': 'اقدام'
    };

    if (typoCorrections[cleanWord]) {
      cleanWord = typoCorrections[cleanWord];
    }
    
    if (cleanWord.length > 3 && cleanWord.startsWith('ال') && !typoCorrections[cleanWord]) {
      cleanWord = cleanWord.substring(2);
    }
    
    const normalized = cleanWord
        .replace(/[أإآ]/g, 'ا')
        .replace(/ى/g, 'ي')
        .replace(/ة/g, 'ه');
    
    const icon = arabicVisualDictionary[cleanWord] || 
                 arabicVisualDictionary[normalized] || 
                 null;
                 
    const isKnown = !!icon;
                 
    return { word, icon, isKnown };
  }).filter(Boolean) as { word: string, icon: React.ReactNode, isKnown: boolean }[];
}
