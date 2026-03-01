'use client';

import { Personnel } from '@/types/personnel';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/app/components/ui/pagination';

interface PersonnelTableProps {
  personnel: Personnel[];
  onEdit: (person: Personnel) => void;
  onDelete: (person: Personnel) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export function PersonnelTable({ personnel, onEdit, onDelete, pagination }: PersonnelTableProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Performance Status</TableHead>
              <TableHead>Excellence Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {personnel.map((person) => (
              <TableRow key={person._id}>
                <TableCell>{`${person.firstName} ${person.lastName}`}</TableCell>
                <TableCell>{person.email}</TableCell>
                <TableCell>{person.department?.name}</TableCell>
                <TableCell>{person.jobTitle}</TableCell>
                <TableCell>
                  {person.performanceStatus ? (
                    <Badge
                      variant={person.performanceStatus === 'Performing' ? 'default' : 'destructive'}
                    >
                      {person.performanceStatus}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">Not classified</span>
                  )}
                </TableCell>
                <TableCell>
                  {person.excellenceStatus && person.excellenceStatus !== 'Not Evaluated' ? (
                    <Badge
                      variant={
                        person.excellenceStatus === 'Excellent'
                          ? 'default'
                          : person.excellenceStatus === 'Good'
                          ? 'secondary'
                          : person.excellenceStatus === 'Average'
                          ? 'outline'
                          : 'destructive'
                      }
                    >
                      {person.excellenceStatus}
                      {person.sixYearAverage && (
                        <span className="ml-1 text-xs">({person.sixYearAverage.toFixed(2)})</span>
                      )}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">Not evaluated</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(person)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(person)} className="text-red-600">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (pagination.currentPage > 1) {
                    pagination.onPageChange(pagination.currentPage - 1);
                  }
                }}
                aria-disabled={pagination.currentPage === 1}
                className={pagination.currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            
            {/* First Page */}
            {pagination.currentPage > 2 && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    pagination.onPageChange(1);
                  }}
                >
                  1
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Ellipsis if far from start */}
            {pagination.currentPage > 3 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Previous Page */}
            {pagination.currentPage > 1 && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    pagination.onPageChange(pagination.currentPage - 1);
                  }}
                >
                  {pagination.currentPage - 1}
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Current Page */}
            <PaginationItem>
              <PaginationLink href="#" isActive>
                {pagination.currentPage}
              </PaginationLink>
            </PaginationItem>

            {/* Next Page */}
            {pagination.currentPage < pagination.totalPages && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    pagination.onPageChange(pagination.currentPage + 1);
                  }}
                >
                  {pagination.currentPage + 1}
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Ellipsis if far from end */}
            {pagination.currentPage < pagination.totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Last Page */}
            {pagination.currentPage < pagination.totalPages - 1 && (
              <PaginationItem>
                <PaginationLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    pagination.onPageChange(pagination.totalPages);
                  }}
                >
                  {pagination.totalPages}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (pagination.currentPage < pagination.totalPages) {
                    pagination.onPageChange(pagination.currentPage + 1);
                  }
                }}
                aria-disabled={pagination.currentPage === pagination.totalPages}
                className={pagination.currentPage === pagination.totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
