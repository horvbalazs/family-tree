import { useMutation, useQuery } from "@tanstack/react-query";
import { useAppConfig } from "../contexts/config.context";
import { Person, PersonFilter, UpsertPersonRequest } from "@org/shared-types";


export const useCreatePerson = () => {
  const { apiUrl } = useAppConfig();
  const { isPending, error, mutate } = useMutation({ mutationFn: (person: UpsertPersonRequest) => fetch(`${apiUrl}/person`, { method: 'POST', headers: { "Content-Type": "application/json" }, body: JSON.stringify(person) }) });

  return { isPending, error, createPerson: mutate }
}

export const useGetPeople = (filter: PersonFilter) => {
  const { apiUrl } = useAppConfig();
  const params = new URLSearchParams(Object.entries(filter));
  const { isLoading, error, data } = useQuery({ queryKey: ['getPeople', filter], queryFn: () => fetch(`${apiUrl}/person?${params}`).then(r => r.json()) })

  return { isLoading, error, people: data as Person[] }
}

export const useGetPersonById = (id: string) => {
  const { apiUrl } = useAppConfig();
  const { isPending, error, mutate } = useMutation({ mutationFn: () => fetch(`${apiUrl}/person/${id}`) });

  return { isPending, error, getPerson: mutate }
}

export const updatePersonById = () => {
  const { apiUrl } = useAppConfig();
  const { isPending, error, mutate } = useMutation({
    mutationFn: ({ id, person }: { id: string, person: UpsertPersonRequest }) => fetch(`${apiUrl}/person/${id}`, { method: 'PUT', headers: { "Content-Type": "application/json" }, body: JSON.stringify(person) })
  });

  return { isPending, error, updatePerson: mutate }
}

export const deletePersonById = () => {
  const { apiUrl } = useAppConfig();
  const { isPending, error, mutate } = useMutation({ mutationFn: (id: string) => fetch(`${apiUrl}/person/${id}`, { method: 'DELETE' }) });

  return { isPending, error, deletePerson: mutate }
}