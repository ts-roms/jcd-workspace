'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/app/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/app/components/ui/command';
import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Subject } from '@/types/subject';
import { Department } from '@/types/department';
import { Personnel } from '@/types/personnel';

/** Sentinel for "None" in Select; Radix Select does not allow value="". */
const NONE_VALUE = '__none__';

const formSchema = z.object({
  code: z.string().min(2, 'Code must be at least 2 characters.'),
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  description: z.string().optional(),
  department: z.string().min(1, 'Department is required.'),
  teacher: z.string().optional(),
  gradeLevel: z.string().optional(),
  semester: z.string().optional(),
  isActive: z.boolean().optional(),
});

interface SubjectFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Subject;
  isSubmitting: boolean;
  departments: Department[];
  personnel: Personnel[];
  userDepartment?: string | { _id: string };
}

export function SubjectForm({
  onSubmit,
  defaultValues,
  isSubmitting,
  departments,
  personnel,
  userDepartment,
}: SubjectFormProps) {
  // Extract department ID if userDepartment is an object
  const userDepartmentId =
    typeof userDepartment === 'string'
      ? userDepartment
      : userDepartment?._id;

  // Filter departments if user is a Dean
  const availableDepartments = userDepartmentId
    ? departments.filter((d) => d._id === userDepartmentId)
    : departments;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: defaultValues?.code || '',
      name: defaultValues?.name || '',
      description: defaultValues?.description || '',
      department: typeof defaultValues?.department === 'string'
        ? defaultValues.department
        : (defaultValues?.department as any)?._id || userDepartmentId || '',
      teacher: typeof defaultValues?.teacher === 'string'
        ? defaultValues.teacher
        : (defaultValues?.teacher as any)?._id || '',
      gradeLevel: defaultValues?.gradeLevel || '',
      semester: defaultValues?.semester || '',
      isActive: defaultValues?.isActive ?? true,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject Code</FormLabel>
              <FormControl>
                <Input placeholder="e.g., MATH101" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Mathematics 101" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Optional description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!!userDepartmentId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableDepartments.map((dept) => (
                    <SelectItem key={dept._id} value={dept._id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="teacher"
          render={({ field }) => {
            const [teacherOpen, setTeacherOpen] = useState(false);
            const activePersonnel = personnel.filter((p) => p.isActive !== false);
            const selectedTeacher = activePersonnel.find((p) => p._id === field.value);
            return (
              <FormItem className="flex flex-col">
                <FormLabel>Teacher (Optional)</FormLabel>
                <Popover open={teacherOpen} onOpenChange={setTeacherOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          'w-full justify-between',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {selectedTeacher
                          ? `${selectedTeacher.firstName} ${selectedTeacher.lastName}`
                          : 'Select teacher'}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search teacher..." />
                      <CommandList>
                        <CommandEmpty>No teacher found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            value="none"
                            onSelect={() => { field.onChange(''); setTeacherOpen(false); }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                !field.value ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            None
                          </CommandItem>
                          {activePersonnel.map((person) => (
                            <CommandItem
                              key={person._id}
                              value={`${person.firstName} ${person.lastName}`}
                              onSelect={() => { field.onChange(person._id); setTeacherOpen(false); }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  field.value === person._id ? 'opacity-100' : 'opacity-0'
                                )}
                              />
                              {person.firstName} {person.lastName}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="gradeLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grade Level (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Grade 11" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="semester"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Semester (Optional)</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(v === NONE_VALUE ? '' : v)}
                  value={field.value || NONE_VALUE}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NONE_VALUE}>None</SelectItem>
                    <SelectItem value="1st">1st Semester</SelectItem>
                    <SelectItem value="2nd">2nd Semester</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </Form>
  );
}
