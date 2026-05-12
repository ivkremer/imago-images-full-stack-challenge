import type { Dispatch, SetStateAction } from 'react';
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from '@/components/ui/combobox';
import type { SearchApiResponse } from '@/lib/search/types';

type Props = {
  facets?: SearchApiResponse['facets'];
  restrictions: string[];
  onSetRestriction: Dispatch<SetStateAction<string[]>>;
};

export const Restrictions = ({ facets, restrictions, onSetRestriction }: Props) => {
  const anchor = useComboboxAnchor();

  return (
    <Combobox
      multiple
      autoHighlight
      items={facets?.restrictions || []}
      value={restrictions}
      onValueChange={(vals) => onSetRestriction((vals as string[]) ?? [])}
    >
      <ComboboxChips ref={anchor} className="w-full">
        <ComboboxValue>
          {(values) => (
            <>
              {(values as string[]).map((value) => (
                <ComboboxChip key={value}>{value.toUpperCase()}</ComboboxChip>
              ))}
              <ComboboxChipsInput placeholder="Select countries" />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item} value={item}>
              {item.toUpperCase()}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};
