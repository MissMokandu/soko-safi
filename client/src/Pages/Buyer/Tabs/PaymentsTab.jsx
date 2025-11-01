import { CreditCard } from 'lucide-react'
import { ListSkeleton } from '../../../Components/SkeletonLoader'

const PaymentsTab = ({ payments, loading, authLoading }) => {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment History</h1>
        <p className="text-gray-600">View all your payment transactions and receipts.</p>
      </div>

      {(loading || authLoading) ? (
        <div className="space-y-6">
          <ListSkeleton />
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-16 text-center rounded-2xl border-2 border-dashed border-gray-300">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-10 h-10 text-primary-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No payment history</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">Your completed payment transactions will appear here once you make purchases.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-900">Order ID</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-900">Date</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-900">Method</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-900">Amount</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-6 text-sm font-semibold text-gray-900">
                      #{payment.order_id || payment.orderId}
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-600">
                      {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : payment.date}
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="w-4 h-4 text-gray-400" />
                        <span>{payment.method || 'M-Pesa'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-primary-600">
                      KSH {(payment.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-2 text-xs font-semibold rounded-full border ${
                        (payment.status || '').toLowerCase() === 'completed'
                          ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300'
                          : (payment.status || '').toLowerCase() === 'pending'
                          ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300'
                          : 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300'
                      }`}>
                        {payment.status || 'Completed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}

export default PaymentsTab