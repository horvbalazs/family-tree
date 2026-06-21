import { useQuery } from '@tanstack/react-query';
import { createContext, FC, PropsWithChildren, use } from 'react';
import z from 'zod';

const appConfig = z.object({
  apiUrl: z.string().nonempty(),
})

export type AppConfig = z.infer<typeof appConfig>;

const AppConfigContext = createContext<AppConfig | undefined>(undefined);

export const AppConfigProvider: FC<PropsWithChildren> = ({ children }) => {
  const { isPending, error, data } = useQuery({
    queryKey: ['appConfig'],
    queryFn: () => fetch('./config.json').then(res => res.json())
  })

  if (isPending) {
    return 'Loading...'
  }

  if (error) {
    return 'An error has occured: ' + error.message
  }

  if (!appConfig.parse(data)) {
    return 'Invalid app config.'
  }

  return <AppConfigContext.Provider value={data}>
    {children}
  </AppConfigContext.Provider>
}

export const useAppConfig = () => {
  const context = use(AppConfigContext);

  if (!context) {
    throw new Error('useAppConfig should be used in AppConfigContext')
  }

  return context;
}
