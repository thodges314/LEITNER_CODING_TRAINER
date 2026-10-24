type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme | ((prev: Theme) => Theme)) => void;
  toggle: () => void;
}

interface ThemeProviderProps {
  children?: React.ReactNode;
  defaultTheme?: Theme;
}

interface ThemeContextResult {
  ThemeProvider: (props: ThemeProviderProps) => JSX.Element;
  useTheme: () => ThemeContextValue;
}

function createThemeContext(): ThemeContextResult {
  const ThemeContext = createContext<ThemeContextValue | null>(null);

  function ThemeProvider({ children, defaultTheme = 'light' }: ThemeProviderProps): JSX.Element {
    const [theme, setTheme] = useState<Theme>(defaultTheme);
    const toggle = useCallback(() => setTheme((t) => (t === 'light' ? 'dark' : 'light')), []);
    const value = useMemo<ThemeContextValue>(() => ({ theme, setTheme, toggle }), [theme, toggle]);
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
  }

  function useTheme(): ThemeContextValue {
    const ctx = useContext<ThemeContextValue | null>(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
    return ctx;
  }

  return { ThemeProvider, useTheme };
}
