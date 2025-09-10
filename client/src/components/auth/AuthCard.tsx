import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReactNode } from 'react';

interface AuthCardProps {
  loginForm: ReactNode;
  registerForm: ReactNode;
}

export default function AuthCard({ loginForm, registerForm }: AuthCardProps) {
  return (
    <Card className="border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <CardHeader>
        <CardTitle className="text-center">Вуруд / Сабтином</CardTitle>
        <CardDescription className="text-center">Ба ҳисоби худ ворид шавед ё ҳисоби нав созед</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Вуруд</TabsTrigger>
            <TabsTrigger value="register">Сабтином</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="mt-6">
            {loginForm}
          </TabsContent>
          <TabsContent value="register" className="mt-6">
            {registerForm}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

