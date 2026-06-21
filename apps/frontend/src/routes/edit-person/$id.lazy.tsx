import { createLazyFileRoute } from '@tanstack/react-router'

export const Route = createLazyFileRoute('/edit-person/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/edit-person/"!</div>
}
