import { Button } from 'antd';
import { Link } from 'react-router-dom';

import PageState from '../../components/PageState/PageState';

const NotFound = () => {
  return (
    <PageState
      kind="not-found"
      action={
        <Link to="/">
          <Button type="primary">Go home</Button>
        </Link>
      }
    />
  );
};

export default NotFound;
