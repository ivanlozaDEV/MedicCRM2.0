/**
 * Paletas de colores predefinidas para organizaciones
 * Cada paleta está diseñada profesionalmente con colores armoniosos
 */

export interface ColorPalette {
  name: string;
  description: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  success_color: string;
  warning_color: string;
  error_color: string;
  info_color: string;
}

export const colorPalettes: ColorPalette[] = [
  {
    name: 'Océano Profesional',
    description: 'Azules y verdes que transmiten confianza y profesionalismo',
    primary_color: '#0EA5E9',    // Sky Blue
    secondary_color: '#10B981',  // Emerald Green
    accent_color: '#F59E0B',     // Amber
    success_color: '#10B981',    // Emerald
    warning_color: '#F59E0B',    // Amber
    error_color: '#EF4444',      // Red
    info_color: '#3B82F6',       // Blue
  },
  {
    name: 'Morado Moderno',
    description: 'Tonos morados con toques vibrantes, ideal para innovación',
    primary_color: '#8B5CF6',    // Violet
    secondary_color: '#EC4899',  // Pink
    accent_color: '#F59E0B',     // Amber
    success_color: '#10B981',    // Emerald
    warning_color: '#F59E0B',    // Amber
    error_color: '#EF4444',      // Red
    info_color: '#6366F1',       // Indigo
  },
  {
    name: 'Verde Salud',
    description: 'Verdes naturales que evocan salud y bienestar',
    primary_color: '#10B981',    // Emerald
    secondary_color: '#14B8A6',  // Teal
    accent_color: '#F59E0B',     // Amber
    success_color: '#22C55E',    // Green
    warning_color: '#F59E0B',    // Amber
    error_color: '#EF4444',      // Red
    info_color: '#0EA5E9',       // Sky
  },
  {
    name: 'Naranja Energético',
    description: 'Naranjas cálidos con energía positiva',
    primary_color: '#F97316',    // Orange
    secondary_color: '#FB923C',  // Orange Light
    accent_color: '#EAB308',     // Yellow
    success_color: '#10B981',    // Emerald
    warning_color: '#F59E0B',    // Amber
    error_color: '#DC2626',      // Red Dark
    info_color: '#0EA5E9',       // Sky
  },
  {
    name: 'Azul Corporativo',
    description: 'Azules tradicionales y confiables para empresas establecidas',
    primary_color: '#1E40AF',    // Blue Dark
    secondary_color: '#3B82F6',  // Blue
    accent_color: '#F59E0B',     // Amber
    success_color: '#10B981',    // Emerald
    warning_color: '#F59E0B',    // Amber
    error_color: '#DC2626',      // Red
    info_color: '#0EA5E9',       // Sky
  },
  {
    name: 'Rosa Cálido',
    description: 'Rosas suaves y acogedores, ideal para atención personalizada',
    primary_color: '#EC4899',    // Pink
    secondary_color: '#F472B6',  // Pink Light
    accent_color: '#A855F7',     // Purple
    success_color: '#10B981',    // Emerald
    warning_color: '#F59E0B',    // Amber
    error_color: '#DC2626',      // Red
    info_color: '#8B5CF6',       // Violet
  },
  {
    name: 'Turquesa Fresco',
    description: 'Turquesas refrescantes que transmiten claridad',
    primary_color: '#14B8A6',    // Teal
    secondary_color: '#06B6D4',  // Cyan
    accent_color: '#F59E0B',     // Amber
    success_color: '#10B981',    // Emerald
    warning_color: '#F59E0B',    // Amber
    error_color: '#EF4444',      // Red
    info_color: '#0EA5E9',       // Sky
  },
  {
    name: 'Índigo Elegante',
    description: 'Índigo sofisticado con toques elegantes',
    primary_color: '#4F46E5',    // Indigo
    secondary_color: '#6366F1',  // Indigo Light
    accent_color: '#F59E0B',     // Amber
    success_color: '#10B981',    // Emerald
    warning_color: '#F59E0B',    // Amber
    error_color: '#EF4444',      // Red
    info_color: '#3B82F6',       // Blue
  },
  {
    name: 'Rojo Dinámico',
    description: 'Rojos vibrantes para organizaciones audaces',
    primary_color: '#DC2626',    // Red
    secondary_color: '#EF4444',  // Red Light
    accent_color: '#F59E0B',     // Amber
    success_color: '#10B981',    // Emerald
    warning_color: '#F59E0B',    // Amber
    error_color: '#B91C1C',      // Red Dark
    info_color: '#3B82F6',       // Blue
  },
  {
    name: 'Gris Minimalista',
    description: 'Grises neutros y modernos con toques de color',
    primary_color: '#6B7280',    // Gray
    secondary_color: '#9CA3AF',  // Gray Light
    accent_color: '#F59E0B',     // Amber
    success_color: '#10B981',    // Emerald
    warning_color: '#F59E0B',    // Amber
    error_color: '#EF4444',      // Red
    info_color: '#3B82F6',       // Blue
  },
];

/**
 * Obtiene una paleta por nombre
 */
export const getPaletteByName = (name: string): ColorPalette | undefined => {
  return colorPalettes.find(p => p.name === name);
};

/**
 * Obtiene la paleta por defecto (Índigo Elegante)
 */
export const getDefaultPalette = (): ColorPalette => {
  return colorPalettes[7]; // Índigo Elegante
};
