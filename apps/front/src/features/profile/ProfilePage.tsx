import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { DetailList } from '@/components/ui/detail-list';
import { roleLabels } from '@/features/auth/roles';
import { useLogout } from '@/features/auth/useLogout';
import { useCurrentUser } from '@/features/auth/useSession';
import { ChangePasswordForm } from './ChangePasswordForm';

export function ProfilePage() {
  const user = useCurrentUser();
  const logout = useLogout();

  const details = [
    { label: 'Prénom', value: user.firstName },
    { label: 'Nom', value: user.lastName },
    { label: 'Adresse e-mail', value: user.email },
    { label: 'Fonction', value: user.job },
    { label: 'Rôle', value: roleLabels[user.role] },
  ];

  return (
    <div className="space-y-6">
      <title>Mon profil – Oriaa</title>
      <h1>Mon profil</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <CardTitle>Mes informations</CardTitle>
          <DetailList details={details} />
        </Card>

        <Card className="space-y-4">
          <CardTitle>Changer mon mot de passe</CardTitle>
          <ChangePasswordForm />
        </Card>
      </div>

      {/* Sur ordinateur, ce bouton est dans la sidebar */}
      <Button
        variant="outline"
        pending={logout.isPending}
        onClick={() => logout.mutate()}
        className="w-full md:hidden"
      >
        <LogOut className="size-4" aria-hidden="true" />
        Se déconnecter
      </Button>
    </div>
  );
}
