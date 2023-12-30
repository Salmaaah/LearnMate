import Sidebar from '../../components/Sidebar/Sidebar';
import UserHeader from '../../components/UserHeader/UserHeader';
import useUserAccess from '../../hooks/useUserAccess';

const Dashboard = () => {
  const { isLoading } = useUserAccess('/dashboard');

  return (
    <div className="dashboard">
      <Sidebar />
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <main>
          <UserHeader pageName="Dashboard" />
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
        </main>
      )}
    </div>
  );
};

export default Dashboard;
