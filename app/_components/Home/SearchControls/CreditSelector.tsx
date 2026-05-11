import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';

type Props = {
  value: string;
  options: string[];
  onChange: (value: string) => void;
};

export const CreditCombobox = ({ value, options, onChange }: Props) => (
  <Combobox value={value || null} autoHighlight items={options} onValueChange={(v: string | null) => onChange(v ?? '')}>
    <ComboboxInput placeholder={value ? value : 'Any publisher'} showTrigger showClear />
    <ComboboxContent>
      <ComboboxEmpty>Any publisher</ComboboxEmpty>
      <ComboboxList>
        {(item) => (
          <ComboboxItem key={item} value={item}>
            {item}
          </ComboboxItem>
        )}
      </ComboboxList>
    </ComboboxContent>
  </Combobox>
);
