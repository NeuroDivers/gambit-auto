
/**
 * Applies a theme class to the document body
 * @param theme The theme to apply
 */
export function applyThemeClass(theme: string) {
  const root = document.documentElement;
  
  // Remove existing theme classes
  const themes = ['light', 'dark', 'system'];
  themes.forEach(t => {
    root.classList.remove(t);
  });
  
  // Add the new theme class
  root.classList.add(theme);
  
  // Store the theme preference if needed
  try {
    localStorage.setItem('theme', theme);
  } catch (error) {
    console.error('Could not save theme preference', error);
  }
}
