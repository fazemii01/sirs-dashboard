import { Link } from 'react-router';
import { SidebarMenuButton } from 'src/components/ui/sidebar';

const Logo = () => {
  return (
    <Link to={'/dashboard'}>
      <SidebarMenuButton
        size="lg"
        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
      >
        <img src="/logo-dlh.png" alt="Logo DLH Lumajang" className="size-8 object-contain" />
      </SidebarMenuButton>
    </Link>
  );
};

export default Logo;
