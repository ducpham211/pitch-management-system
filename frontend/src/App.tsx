import { useState } from 'react'
import Button from './components/common/Button'
import Input from './components/common/Input'

function App() {
  const [testValue, setTestValue] = useState('')

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-blue-600 mb-6 text-center">
          Tailwind & Components Test
        </h1>
        
        <Input 
          label="Test Input" 
          placeholder="Nhập thử gì đó..." 
          value={testValue}
          onChange={(e) => setTestValue(e.target.value)}
        />

        <div className="flex flex-col gap-3 mt-6">
          <Button variant="primary" onClick={() => alert(`Nội dung: ${testValue}`)}>
            Test Primary
          </Button>
          <Button variant="secondary">
            Test Secondary
          </Button>
          <Button variant="danger">
            Test Danger
          </Button>
        </div>
      </div>
    </div>
  )
}

export default App