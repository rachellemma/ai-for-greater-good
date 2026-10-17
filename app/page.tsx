import { FarmerConsole } from '@/components/farmer/farmer-console'
import { farmers } from '@/lib/store'

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <FarmerConsole farmers={farmers} />
    </main>
  )
}
