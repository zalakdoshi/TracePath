import { useEffect, useState } from 'react'
import { BrowserProvider, Contract } from 'ethers'
import { AlertTriangle } from 'lucide-react'
import contractInfo from './contracts/contractInfo.json'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Toast } from './components/Toast'
import { Dashboard } from './components/Dashboard'
import { BatchDetail } from './components/BatchDetail'
import { RegisterForm } from './components/RegisterForm'
import { TrackPage } from './components/TrackPage'

export default function App() {
  const [account, setAccount] = useState('')
  const [signer, setSigner] = useState(null)
  const [contract, setContract] = useState(null)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [selectedBatchId, setSelectedBatchId] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const configured = Boolean(contractInfo.address && contractInfo.abi?.length)

  async function connectWallet() {
    setError('')
    try {
      if (!window.ethereum) throw new Error('MetaMask not detected. Install it first.')
      const provider = new BrowserProvider(window.ethereum)
      await provider.send('eth_requestAccounts', [])
      const s = await provider.getSigner()
      const network = await provider.getNetwork()
      
      // Accept both Hardhat Local (31337) and Sepolia (11155111)
      if (network.chainId !== 31337n && network.chainId !== 11155111n) {
        setError('Please switch to Hardhat Local or Sepolia testnet in MetaMask')
        return
      }

      const c = configured ? new Contract(contractInfo.address, contractInfo.abi, s) : null
      setAccount(await s.getAddress())
      setSigner(s)
      setContract(c)
    } catch (e) {
      setError(e.message || 'Failed to connect wallet')
    }
  }

  useEffect(() => {
    const checkConnection = async () => {
      if (!window.ethereum) return
      try {
        const provider = new BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()
        if (accounts.length > 0) {
          connectWallet()
        }
      } catch (e) {
        console.log('Could not auto-connect wallet')
      }
    }
    checkConnection()
  }, [])

  function navigate(page, batchId) {
    if (page === 'batch') {
      setSelectedBatchId(batchId)
      setCurrentPage('batch-detail')
    } else {
      setCurrentPage(page)
    }
  }

  function showError(msg) {
    setError(msg)
  }

  function showSuccess(msg) {
    setSuccess(msg)
    setTimeout(() => setSuccess(''), 3000)
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-default">
      <Header
        account={account}
        onConnectWallet={connectWallet}
        currentPage={currentPage}
        onNavigate={navigate}
      />

      <main className="flex-1">
        {!configured && (
          <div className="bg-red-50 border-b border-red-200 px-6 md:px-10 py-4">
            <div className="max-w-6xl mx-auto flex items-start gap-3">
              <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-900">
                <b>Contract not configured.</b> Run <code className="bg-red-100 px-1 rounded font-mono">npm run deploy:local</code> from the blockchain directory.
              </div>
            </div>
          </div>
        )}

        {currentPage === 'dashboard' && (
          <Dashboard
            onNavigateToBatch={(id) => navigate('batch', id)}
            onError={showError}
          />
        )}

        {currentPage === 'batch-detail' && selectedBatchId && (
          <BatchDetail
            batchId={selectedBatchId}
            onBack={() => setCurrentPage('dashboard')}
            onError={showError}
          />
        )}

        {currentPage === 'register' && (
          <RegisterForm
            signer={signer}
            contract={contract}
            onSuccess={showSuccess}
            onError={showError}
            onNavigate={navigate}
          />
        )}

        {currentPage === 'track' && (
          <TrackPage onError={showError} />
        )}
      </main>

      <Footer />

      {error && (
        <Toast
          message={error}
          type="error"
          onDismiss={() => setError('')}
        />
      )}

      {success && (
        <Toast
          message={success}
          type="success"
          onDismiss={() => setSuccess('')}
        />
      )}
    </div>
  )
}
