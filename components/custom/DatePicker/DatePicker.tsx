import { useMemo } from 'react';
import { Calendar as CalendarIcon, XIcon } from 'lucide-react';
import { isValid, parseISO } from 'date-fns';
import { format as fmt } from 'date-fns/format';
import { Field, FieldContent, FieldLabel } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';

type Props = {
  id: string;
  label: string;
  // can be empty:
  value: string;
  onChange: (v: string) => void;
  min?: string;
  max?: string;
};

export const DatePicker = ({ id, label, value, onChange, min, max }: Props) => {
  const selectedDate = useMemo(() => {
    if (!value) {
      return undefined;
    }
    const d = parseISO(value);
    return isValid(d) ? d : undefined;
  }, [value]);

  const minDate = useMemo(() => (min ? parseISO(min) : undefined), [min]);
  const maxDate = useMemo(() => (max ? parseISO(max) : undefined), [max]);

  return (
    <Field>
      <FieldLabel asChild>
        <Label htmlFor={id}>{label}</Label>
      </FieldLabel>
      <FieldContent>
        <Popover>
          <PopoverTrigger asChild>
            <Button id={id} variant="outline" className="w-full justify-start h-9 rounded-4xl font-normal">
              <CalendarIcon className="mr-2 size-4" />
              {selectedDate ? fmt(selectedDate, 'PPP') : <span className="text-muted-foreground">Pick a date</span>}
              {selectedDate && (
                <span
                  className="ml-auto opacity-70 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange('');
                  }}
                >
                  <XIcon className="size-4" />
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" sideOffset={8} className="p-0 w-auto">
            <Calendar
              mode="single"
              weekStartsOn={1}
              selected={selectedDate}
              // `{ before: minDate, after: maxDate }` causes a TS error though works:
              disabled={(date) => {
                if (minDate && date < minDate) {
                  return true;
                }

                return Boolean(maxDate && date > maxDate);
              }}
              defaultMonth={selectedDate || minDate || maxDate || new Date()}
              captionLayout="dropdown"
              onSelect={(d: Date | undefined) => {
                if (!d) {
                  onChange('');
                  return;
                }
                const iso = fmt(d, 'yyyy-MM-dd');
                onChange(iso);
              }}
            />
          </PopoverContent>
        </Popover>
      </FieldContent>
    </Field>
  );
};
