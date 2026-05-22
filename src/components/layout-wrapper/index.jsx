import Layout from '@/components/layout/index.jsx';
import ModifiedFooter from '@/components/layout/footer';
import ModifiedHeader from '@/components/layout/header';
import ModifiedMain from '@/components/layout/main';
import Sidebar from '@/components/layout/sidebar';

const LayoutWrapper = () => {
  return <Layout header={<ModifiedHeader />} sidebar={<Sidebar />} main={<ModifiedMain />} footer={<ModifiedFooter />} />;
};

export default LayoutWrapper;
