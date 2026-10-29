import { useEffect } from "react";
import { DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useTheme, type ThemePref } from "@/lib/theme";

/** Light / Dark, inside the avatar menu. */
export function ThemeMenuItems() {
  const { pref, setPref } = useTheme();
  return (
    <>
      <DropdownMenuLabel>Appearance</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={pref === "dark" ? "dark" : "light"} onValueChange={(v) => setPref(v as ThemePref)}>
        <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
      <DropdownMenuSeparator />
    </>
  );
}

/** Keeps the html dark class and the phone status-bar colour in step with the chosen mode (all screens). */
export function useThemeChrome(dark: boolean) {
  useEffect(() => {
    const h = document.documentElement;
    h.dataset["theme"] = dark ? "dark" : "light";
    h.classList.toggle("dark", dark);
    const meta = document.querySelector('meta[name="theme-color"]');
    const v = getComputedStyle(h).getPropertyValue(dark ? "--chrome-dark" : "--chrome-light").trim();
    if (meta && v) meta.setAttribute("content", v);
  }, [dark]);
}
