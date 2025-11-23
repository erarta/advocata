'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LawyerStatusBadge } from '@/components/lawyers/lawyer-status-badge';
import { VerificationModal } from '@/components/lawyers/verification-modal';
import { usePendingLawyers } from '@/lib/hooks/use-lawyers';
import { formatDate, formatRelativeTime } from '@/lib/utils/formatters';
import { Search, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import type { PendingLawyer } from '@/lib/types/lawyer';

export default function PendingLawyersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedLawyer, setSelectedLawyer] = useState<PendingLawyer | null>(null);
  const [verificationModal, setVerificationModal] = useState(false);
  const limit = 20;

  const { data, isLoading, error } = usePendingLawyers({
    page,
    limit,
    search,
  });

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-4 text-lg font-semibold">Error loading pending lawyers</h3>
          <p className="mt-2 text-gray-600">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pending Lawyer Verifications</h1>
          <p className="text-gray-600">Review and verify lawyer applications</p>
        </div>
        <Badge variant="destructive" className="text-lg">
          {data?.total || 0} Pending
        </Badge>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Lawyers List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading pending lawyers...</p>
          </div>
        </div>
      ) : data?.items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h3 className="mt-4 text-lg font-semibold">All caught up!</h3>
            <p className="mt-2 text-gray-600">No pending lawyer verifications at the moment</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data?.items.map((lawyer) => (
            <Card key={lawyer.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold">{lawyer.fullName}</h3>
                      {lawyer.isUrgent && (
                        <Badge variant="destructive">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Urgent
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <p>Email: {lawyer.email}</p>
                      <p>Phone: {lawyer.phoneNumber}</p>
                      <p>License: {lawyer.licenseNumber}</p>
                      <p>Experience: {lawyer.experienceYears} years</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {lawyer.specializations.map((spec) => (
                          <Badge key={spec} variant="secondary">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="ml-6 space-y-2 text-right">
                    <p className="text-sm text-gray-600">
                      Submitted {formatRelativeTime(lawyer.submittedAt)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(lawyer.submittedAt)}
                    </p>
                    <div className="mt-4 space-x-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => {
                          setSelectedLawyer(lawyer);
                          setVerificationModal(true);
                        }}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Проверить
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Verification Modal */}
      {selectedLawyer && (
        <VerificationModal
          lawyer={selectedLawyer}
          isOpen={verificationModal}
          onClose={() => {
            setVerificationModal(false);
            setSelectedLawyer(null);
          }}
          onVerify={(decision) => {
            console.log('Verification decision for', selectedLawyer.fullName, ':', decision);
            // TODO: Refresh the list after verification
          }}
        />
      )}
    </div>
  );
}
