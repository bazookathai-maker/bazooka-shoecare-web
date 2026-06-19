import { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  getPostcodeBySubdistrict,
  searchDistricts,
  searchProvinces,
  searchSubdistricts,
} from '../data/thaiAddress';
import './ThaiAddressSelector.css';

function SearchableCombobox({
  label,
  placeholder,
  value,
  searchFn,
  onChange,
  disabled = false,
  required = false,
  allowCustom = false,
}) {
  const listId = useId();
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const blurTimerRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(
    () => () => {
      window.clearTimeout(blurTimerRef.current);
    },
    [],
  );

  const filteredOptions = useMemo(() => {
    if (disabled) return [];
    return searchFn(query);
  }, [disabled, query, searchFn]);

  const commitValue = (nextValue) => {
    const trimmed = nextValue.trim();
    if (!trimmed) {
      onChange('');
      setQuery('');
      return;
    }

    if (allowCustom) {
      onChange(trimmed);
      setQuery(trimmed);
      return;
    }

    const matches = searchFn(trimmed);
    if (matches.includes(trimmed)) {
      onChange(trimmed);
      setQuery(trimmed);
      return;
    }

    setQuery(value || '');
  };

  const handleSelect = (option) => {
    window.clearTimeout(blurTimerRef.current);
    onChange(option);
    setQuery(option);
    setOpen(false);
  };

  const handleBlur = () => {
    blurTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      commitValue(query);
    }, 120);
  };

  return (
    <label className="checkout__field thai-address__field">
      <span className="checkout__field-label">{label}</span>
      <div className={`address-combobox${open ? ' address-combobox--open' : ''}`}>
        <input
          type="text"
          className="checkout__input address-combobox__input"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            window.clearTimeout(blurTimerRef.current);
            setOpen(true);
          }}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
        />
        {open && !disabled ? (
          <ul id={listId} className="address-combobox__list" role="listbox">
            {filteredOptions.length ? (
              filteredOptions.map((option) => (
                <li key={option} role="presentation">
                  <button
                    type="button"
                    className="address-combobox__option"
                    role="option"
                    aria-selected={option === value}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSelect(option)}
                  >
                    {option}
                  </button>
                </li>
              ))
            ) : (
              <li className="address-combobox__empty" role="presentation">
                ไม่พบข้อมูลที่ตรงกับคำค้นหา
              </li>
            )}
          </ul>
        ) : null}
      </div>
    </label>
  );
}

export default function ThaiAddressSelector({ value, onChange }) {
  const handleProvinceChange = (province) => {
    onChange({
      province,
      district: '',
      subdistrict: '',
      postalCode: '',
    });
  };

  const handleDistrictChange = (district) => {
    onChange({
      district,
      subdistrict: '',
      postalCode: '',
    });
  };

  const handleSubdistrictChange = (subdistrict) => {
    const postalCode = getPostcodeBySubdistrict(
      value.province,
      value.district,
      subdistrict,
    );

    onChange({
      subdistrict,
      postalCode: postalCode || value.postalCode,
    });
  };

  return (
    <div className="thai-address">
      <SearchableCombobox
        label="จังหวัด"
        placeholder="เลือกหรือค้นหาจังหวัด"
        value={value.province}
        searchFn={(query) => searchProvinces(query)}
        onChange={handleProvinceChange}
        required
      />

      <SearchableCombobox
        label="เขต/อำเภอ"
        placeholder="เลือกหรือค้นหาเขต/อำเภอ"
        value={value.district}
        searchFn={(query) => searchDistricts(value.province, query)}
        onChange={handleDistrictChange}
        disabled={!value.province}
        required
      />

      <SearchableCombobox
        label="แขวง/ตำบล"
        placeholder="เลือกหรือค้นหาแขวง/ตำบล"
        value={value.subdistrict}
        searchFn={(query) =>
          searchSubdistricts(value.province, value.district, query)
        }
        onChange={handleSubdistrictChange}
        disabled={!value.district}
        required
      />

      <SearchableCombobox
        label="ถนน"
        placeholder="เช่น ถนนสุขุมวิท"
        value={value.street}
        searchFn={() => []}
        onChange={(street) => onChange({ street })}
        allowCustom
      />

      <label className="checkout__field thai-address__field">
        <span className="checkout__field-label">รหัสไปรษณีย์</span>
        <input
          type="text"
          name="postalCode"
          value={value.postalCode}
          onChange={(event) => onChange({ postalCode: event.target.value })}
          required
          inputMode="numeric"
          autoComplete="postal-code"
          className="checkout__input"
          placeholder="กรอกรหัสไปรษณีย์"
        />
      </label>
    </div>
  );
}
