
            <Input
              id={`service-item-${index}-unit_price`}
              placeholder="Unit Price"
              type="number"
              step="0.01"
              value={item.unit_price || ''}
              onChange={(e) => {
                const price = parseFloat(e.target.value) || 0;
                handleItemChange(index, 'unit_price', price);
              }}
              className="w-full"
            />
