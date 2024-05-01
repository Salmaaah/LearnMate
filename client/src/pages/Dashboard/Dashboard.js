import Layout from '../Layout/Layout';
import useUserAccess from '../../hooks/useUserAccess';

const Dashboard = () => {
  const { isLoading } = useUserAccess('/dashboard');

  return (
    <Layout pageName="Dashboard">
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div style={{ display: 'flex' }}>
          <div
            style={{
              whiteSpace: 'nowrap',
            }}
          >
            something here
          </div>
          <div
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Illo sequi
            deserunt neque, at tenetur corporis officia, laudantium dicta ut
            quisquam minima alias exercitationem consequuntur! Repellat modi sed
            ipsa laboriosam amet.
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;
