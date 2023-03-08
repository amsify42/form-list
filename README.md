# form-list
JQuery library for managing list of forms which performs CRUD operations.

## Example
```html
<table id="myTable">
  	<thead>
    	<tr>
			<th>Sr No.</th>	
			<th>Supplier</th>
			<th>Description</th>
			<th>Actions</th>
    	</tr>
  	</thead>
	<tbody>
	  	<tr>
			<td class="serial-number">
				1
			</td>
			<td>
				<input
				type="text"
				name="supplier"
				placeholder="Supplier">
			</td>
			<td>
				<textarea rows="1" name="description" placeholder="Description"></textarea>
			</td>
			<td>
				<button type="button" id="addFormItem">
					Add
				</button>
			</td>
		</tr>
	</tbody>
</table>
```
```js
var myTable = new FormList('#myTable');
poDeliveryTable.init('#addFormItem');
```
