import { Suspense, ComponentType, FC, ReactNode } from 'react';
import Spinner from '../../../../views/spinner/Spinner';

// ===========================|| LOADABLE - LAZY LOADING ||=========================== //

const Loadable =
  <P extends object>(Component: ComponentType<P>, fallback?: ReactNode): FC<P> =>
  (props: P) =>
    (
      <Suspense fallback={fallback || <Spinner />}>
        <Component {...props} />
      </Suspense>
    );

export default Loadable;
