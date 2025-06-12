import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedSection, FadeInUp, SlideInFromLeft, ScaleIn, StaggerContainer } from "@/components/transitions/PageTransition";
import { useTheme } from "@/providers/ThemeProvider";
import { Link } from "wouter";
import { ArrowRight, Sparkles, Zap, Eye, Palette } from "lucide-react";

export default function TransitionsDemo() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <FadeInUp className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Smooth Page Transitions
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience seamless navigation with theme-aware animations that adapt to your preferences
          </p>
        </FadeInUp>

        {/* Theme Demo Section */}
        <AnimatedSection delay={200} className="mb-12">
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme-Based Animations
              </CardTitle>
              <CardDescription>
                Animations automatically adapt to your current theme for optimal visual experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Current Theme: {resolvedTheme}</p>
                  <p className="text-sm text-muted-foreground">
                    {resolvedTheme === 'dark' 
                      ? 'Smooth, flowing animations with enhanced easing'
                      : 'Crisp, responsive animations with snappy timing'
                    }
                  </p>
                </div>
                <Button onClick={toggleTheme} variant="outline">
                  Switch to {resolvedTheme === 'dark' ? 'Light' : 'Dark'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Animation Types */}
        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <SlideInFromLeft delay={300}>
            <Card className="h-full hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                  <CardTitle>Fade Transitions</CardTitle>
                </div>
                <CardDescription>
                  Gentle opacity changes for smooth content reveals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">Elegant</Badge>
                <Badge variant="outline" className="ml-2">Subtle</Badge>
              </CardContent>
            </Card>
          </SlideInFromLeft>

          <ScaleIn delay={500}>
            <Card className="h-full hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <CardTitle>Scale Animations</CardTitle>
                </div>
                <CardDescription>
                  Dynamic scaling effects for engaging interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">Dynamic</Badge>
                <Badge variant="outline" className="ml-2">Engaging</Badge>
              </CardContent>
            </Card>
          </ScaleIn>

          <FadeInUp delay={700}>
            <Card className="h-full hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <CardTitle>Slide Effects</CardTitle>
                </div>
                <CardDescription>
                  Directional movement for natural flow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">Flowing</Badge>
                <Badge variant="outline" className="ml-2">Natural</Badge>
              </CardContent>
            </Card>
          </FadeInUp>
        </StaggerContainer>

        {/* Navigation Demo */}
        <AnimatedSection delay={900} className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Test Navigation Transitions</CardTitle>
              <CardDescription>
                Navigate between pages to experience the smooth transition effects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Home
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full">
                    Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button variant="outline" className="w-full">
                    Auth
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/api/docs">
                  <Button variant="outline" className="w-full">
                    API Docs
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground">
                Each navigation will trigger smooth page transitions that adapt to your current theme
              </p>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Back to Home */}
        <FadeInUp delay={1100} className="text-center mt-12">
          <Link href="/">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Back to Home
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </FadeInUp>
      </div>
    </div>
  );
}