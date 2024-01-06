import Layout from '../Layout/Layout';
import useUserAccess from '../../hooks/useUserAccess';

const Dashboard = () => {
  const { isLoading } = useUserAccess('/dashboard');

  return (
    <Layout pageName="Dashboard">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Ad eius
          blanditiis maiores, facere voluptate hic. Assumenda repellat
          accusantium molestias nulla odit eaque expedita, optio rem quasi ad
          qui iure officia. Lorem ipsum dolor sit amet consectetur adipisicing
          elit. Ad eius blanditiis maiores, facere voluptate hic. Assumenda
          repellat accusantium molestias nulla odit eaque expedita, optio rem
          quasi ad qui iure officia. Lorem ipsum dolor sit amet consectetur
          adipisicing elit. Ad eius blanditiis maiores, facere voluptate hic.
          Assumenda repellat accusantium molestias nulla odit eaque expedita,
          optio rem quasi ad qui iure officia.
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
