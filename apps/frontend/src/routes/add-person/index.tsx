import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/add-person/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/add-person/"!</div>
}
