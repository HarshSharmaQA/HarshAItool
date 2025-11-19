
'use client';

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Eye, Download } from "lucide-react";
import type { ContactSubmission } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { useCollection } from "@/firebase/firestore/use-collection";
import { collection, query, orderBy } from 'firebase/firestore';
import { db } from "@/lib/firebase";
import DeleteButton from './delete-button';

interface ContactSubmissionWithId extends ContactSubmission {
    id: string;
}

export default function ContactsAdminPage() {
    const contactsQuery = db ? query(collection(db, 'contacts'), orderBy('submittedAt', 'desc')) : null;
    const { data: submissions, loading, setData: setSubmissions } = useCollection<ContactSubmissionWithId>(contactsQuery);
    const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmissionWithId | null>(null);

    const handleSubmissionDeleted = (submissionId: string) => {
        if (submissions) {
        setSubmissions(submissions.filter(s => s.id !== submissionId));
        }
    };

  const downloadCSV = () => {
    if (!submissions) return;

    const escapeCSV = (str: any) => {
        if (str === null || str === undefined) return '""';
        const value = String(str);
        return `"${value.replace(/"/g, '""')}"`;
    };

    const headers = "Name,Email,Phone,Company,Subject,Message,Submitted At\n";
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers
      + submissions.map(s => {
          const submittedAtDate = s.submittedAt ? format(new Date(s.submittedAt), 'yyyy-MM-dd HH:mm:ss') : '';
          return [
            escapeCSV(s.name),
            escapeCSV(s.email),
            escapeCSV(s.phone),
            escapeCSV(s.company),
            escapeCSV(s.subject),
            escapeCSV(s.message),
            `"${submittedAtDate}"`
          ].join(",");
        }).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "contact-submissions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const getFormattedDate = (timestamp: any, includeTime = false) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return format(date, includeTime ? "MMM d, yyyy, h:mm a" : "MMM d, yyyy");
  }

  return (
    <>
       <div className="flex items-center justify-between mb-4">
          <div/>
            <Button onClick={downloadCSV} size="sm" disabled={!submissions || submissions.length === 0}>
                <Download className="h-4 w-4 mr-2"/>Export CSV
            </Button>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Contact Form Submissions</CardTitle>
          <CardDescription>
              {loading ? 'Loading...' : `You have ${submissions?.length || 0} total submissions.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>From</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="hidden md:table-cell">Company</TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {loading ? (
              <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
              </TableRow>
            ) : submissions && submissions.length > 0 ? (
              submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <div className="font-medium">{submission.name}</div>
                    <div className="text-sm text-muted-foreground">{submission.email}</div>
                  </TableCell>
                  <TableCell className="font-medium">{submission.subject}</TableCell>
                  <TableCell className="hidden md:table-cell">{submission.company}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {getFormattedDate(submission.submittedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedSubmission(submission)}>
                            <Eye className="h-4 w-4" />
                        </Button>
                        <DeleteButton submissionId={submission.id} onDeleted={() => handleSubmissionDeleted(submission.id)} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                      No submissions found.
                  </TableCell>
              </TableRow>
            )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={!!selectedSubmission} onOpenChange={(isOpen) => !isOpen && setSelectedSubmission(null)}>
        <DialogContent className="sm:max-w-xl">
          {selectedSubmission && (
            <>
            <DialogHeader>
                <DialogTitle>{selectedSubmission.subject}</DialogTitle>
                <DialogDescription>
                    From: {selectedSubmission.name} &lt;{selectedSubmission.email}&gt;
                    <br />
                    Date: {getFormattedDate(selectedSubmission.submittedAt, true)}
                </DialogDescription>
            </DialogHeader>
             <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <p className="font-semibold">Company</p>
                    <p className="text-muted-foreground">{selectedSubmission.company || 'N/A'}</p>
                </div>
                <div>
                    <p className="font-semibold">Phone</p>
                    <p className="text-muted-foreground">{selectedSubmission.phone || 'N/A'}</p>
                </div>
            </div>
            <div className="mt-4 bg-muted/50 p-4 rounded-md max-h-[50vh] overflow-y-auto border">
                <p className="text-sm whitespace-pre-wrap">{selectedSubmission.message}</p>
            </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
