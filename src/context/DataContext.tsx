import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { decryptData } from '../data/info_fetching'
import type { Data } from '../data/types'
import { filterDataByRole } from '../data/filterByRole'


type DataContextType = {
    decryptedData: Data | null
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
    const [decryptedData, setDecryptedData] = useState<Data | null >(null)


    useEffect(() => {
        
        const handleMessage = (event: MessageEvent) => {
            if (
                event.origin !== 'https://portalcc.medismart.net' ||
                !event.data ||
                typeof event.data !== 'object'
            ) {
                console.log(
                    "Ignore messages from unknown origins. Content won't be decoded"
                )

                return
            }
            const { action, data: key, role: _role } = event.data

            if (action !== 'init') {
                return
            }

            fetch(
                'https://gist.githubusercontent.com/WFM-HM/e36c709361fee3b2739f64ff969ec6c0/raw',
                { cache: 'no-store' }
            )
                .then(async (response) => {
                    console.log('FETCH OK:', response.ok)

                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`)
                    }

                    const text = await response.text()
                    return text
                })
                .then(async (storedText) => {
                    const decryptedData = await decryptData(storedText, key)
                    setDecryptedData(filterDataByRole(decryptedData, _role))
                })

                .catch((error) => {
                    console.error('FETCH/DECRYPT ERROR:', error)
                })
        }
        window.addEventListener('message', handleMessage)

        window.parent.postMessage(
            { action: 'ready' },
            'https://portalcc.medismart.net'
        )
        return () => {
            window.removeEventListener('message', handleMessage)
        }
    }, [])

    return (
        <DataContext.Provider value={{ decryptedData }}>
            {children}
        </DataContext.Provider>
    )
}

export function useData() {
    const context = useContext(DataContext)

    if (!context) {
        throw new Error('useData must be used inside DataProvider')
    }

    return context
}
