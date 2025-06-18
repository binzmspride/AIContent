import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { AdaptiveThemeSwitcher } from "@/components/common/AdaptiveThemeSwitcher";
import { FloatingThemeOrb } from "@/components/common/FloatingThemeOrb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/providers/ThemeProvider";
import { 
  Palette, 
  Sparkles, 
  Moon, 
  Sun, 
  Zap, 
  Rainbow,
  Settings,
  Eye,
  ToggleLeft
} from "lucide-react";

export default function ThemeDemo() {
  const { theme } = useTheme();
  const [animationDemo, setAnimationDemo] = useState<string | null>(null);

  const triggerAnimation = (type: string) => {
    setAnimationDemo(type);
    setTimeout(() => setAnimationDemo(null), 2000);
  };

  return (
    <DashboardLayout title="Theme Switcher Demo">
      <div className="theme-transition space-y-8">
        {/* Hero Section */}
        <div className="text-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-purple-900 rounded-2xl p-8">
          <div className="flex justify-center mb-4">
            <div className={`p-4 rounded-full bg-white dark:bg-gray-800 shadow-lg ${animationDemo === 'sparkle' ? 'sparkle-animation' : ''}`}>
              <Palette className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Adaptive Theme Switcher
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Experience smooth theme transitions with playful animations and multiple switcher variants. 
            Current theme: <Badge variant="secondary">{theme}</Badge>
          </p>
        </div>

        {/* Theme Switcher Variants */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="theme-transition">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Default Variant
              </CardTitle>
              <CardDescription>
                Standard theme switcher with labels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AdaptiveThemeSwitcher 
                variant="default" 
                showLabels={true}
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Perfect for settings pages and main navigation
              </p>
            </CardContent>
          </Card>

          <Card className="theme-transition">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ToggleLeft className="h-5 w-5" />
                Icon Variant
              </CardTitle>
              <CardDescription>
                Compact icon-only switcher
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <AdaptiveThemeSwitcher 
                  variant="icon" 
                  showDropdown={true}
                  size="lg"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Great for headers and toolbars
              </p>
            </CardContent>
          </Card>

          <Card className="theme-transition">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Playful Variant
              </CardTitle>
              <CardDescription>
                Enhanced with fun animations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AdaptiveThemeSwitcher 
                variant="outline" 
                playful={true}
                showLabels={true}
                size="md"
                className="w-full"
              />
              <p className="text-sm text-muted-foreground">
                Includes hover effects and transitions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Size Variations */}
        <Card className="theme-transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Size Options
            </CardTitle>
            <CardDescription>
              Different sizes for various use cases
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3">
                <h4 className="font-medium">Small</h4>
                <AdaptiveThemeSwitcher size="sm" variant="default" showLabels={true} />
                <p className="text-xs text-muted-foreground">Compact spaces</p>
              </div>
              
              <div className="text-center space-y-3">
                <h4 className="font-medium">Medium</h4>
                <AdaptiveThemeSwitcher size="md" variant="default" showLabels={true} />
                <p className="text-xs text-muted-foreground">Standard use</p>
              </div>
              
              <div className="text-center space-y-3">
                <h4 className="font-medium">Large</h4>
                <AdaptiveThemeSwitcher size="lg" variant="default" showLabels={true} />
                <p className="text-xs text-muted-foreground">Prominent display</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Floating Orb Showcase */}
        <Card className="theme-transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rainbow className="h-5 w-5" />
              Floating Theme Orb
            </CardTitle>
            <CardDescription>
              Always-accessible floating theme controls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="relative h-32 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <FloatingThemeOrb position="top-left" showSwitcher={false} />
                <p className="text-xs text-center mt-8">Top Left</p>
              </div>
              
              <div className="relative h-32 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <FloatingThemeOrb position="top-right" showSwitcher={false} />
                <p className="text-xs text-center mt-8">Top Right</p>
              </div>
              
              <div className="relative h-32 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <FloatingThemeOrb position="bottom-left" showSwitcher={false} />
                <p className="text-xs text-center mt-8">Bottom Left</p>
              </div>
              
              <div className="relative h-32 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <FloatingThemeOrb position="bottom-right" showSwitcher={false} />
                <p className="text-xs text-center mt-8">Bottom Right</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              The floating orb provides quick theme access from anywhere on the page. 
              Check the bottom-right corner for the live example!
            </p>
          </CardContent>
        </Card>

        {/* Animation Demos */}
        <Card className="theme-transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Animation Effects
            </CardTitle>
            <CardDescription>
              Interactive animations and transitions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                onClick={() => triggerAnimation('sparkle')}
                className="h-20 flex flex-col gap-2"
              >
                <Sparkles className={`h-6 w-6 ${animationDemo === 'sparkle' ? 'sparkle-animation' : ''}`} />
                <span className="text-xs">Sparkle</span>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => triggerAnimation('pulse')}
                className="h-20 flex flex-col gap-2"
              >
                <div className={`h-6 w-6 rounded-full bg-blue-500 ${animationDemo === 'pulse' ? 'orb-pulse' : ''}`} />
                <span className="text-xs">Pulse</span>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => triggerAnimation('float')}
                className="h-20 flex flex-col gap-2"
              >
                <Moon className={`h-6 w-6 ${animationDemo === 'float' ? 'float-animation' : ''}`} />
                <span className="text-xs">Float</span>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => triggerAnimation('gradient')}
                className="h-20 flex flex-col gap-2"
              >
                <Sun className={`h-6 w-6 ${animationDemo === 'gradient' ? 'gradient-text' : ''}`} />
                <span className="text-xs">Gradient</span>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Click the buttons above to preview different animation effects used throughout the theme switcher components.
            </p>
          </CardContent>
        </Card>

        {/* Technical Details */}
        <Card className="theme-transition">
          <CardHeader>
            <CardTitle>Technical Implementation</CardTitle>
            <CardDescription>
              Built with modern web technologies for optimal performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Features</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Smooth CSS transitions with cubic-bezier easing</li>
                  <li>• Persistent theme preferences via localStorage</li>
                  <li>• System theme detection and auto-switching</li>
                  <li>• Keyboard accessibility support</li>
                  <li>• Responsive design for all screen sizes</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Components</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• AdaptiveThemeSwitcher: Main component</li>
                  <li>• FloatingThemeOrb: Floating access point</li>
                  <li>• ThemeProvider: Context management</li>
                  <li>• CSS animations: sparkle, pulse, float</li>
                  <li>• Tailwind dark mode integration</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}