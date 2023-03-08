(function($, window, document, undefined) {

	var FormList = function(tableSelector) {
		this.table  	= tableSelector;
		this.settings   = {
			preEditText : 'Edit',
			updateText 	: 'Save',
			cancelText  : 'Cancel', 
			allowRemove : true,
			removeTxt   : 'X',
			tBody 		: 'tbody',
			afterAdd 	: null,
			afterDelete : null
		};
		this.actionButton 	 = '.form-list-action-button'; 
		this.editReadyClass  = 'ready-to-edit';
		this.inAction 		 = 'form-list-in-action'
		this.tBody 			 = null;
		this.row 			 = null;
		this.submit 		 = null;
	};

	FormList.prototype = {

		_settings : function(settings) {
			this.settings = $.extend(this.settings, settings);
		},

		init : function(submitBtn) {
			this.tBody  = $(this.table).find(this.settings.tBody);
			this.submit = submitBtn;
			this.row  	= $(this.submit).closest('tr');
			this.setEvents();
			this.loadData();
		},

		addedItems: function() {
			return $(this.tBody).find('tr:not(:last)');
		},

		lastRow: function() {
			return this.row;
		},

		sTBody: function() {
			return this.settings.tBody;
		},

		setEvents: function() {
			var _self = this;
			$(this.table).find(this.submit).click(function(e){
				e.preventDefault();
				if(!$(_self.row).hasClass(_self.inAction)) {
					$(_self.row).addClass(_self.inAction);
					var ajaxURL = $(_self.row).attr('data-ajax');
					if(ajaxURL) {
						_self.submitAction(ajaxURL);
					} else {
						$(_self.submit).prop('disabled', 1).addClass('disabled');
						$(_self.row).find(':input').prop('disabled', 1).addClass('disabled');
						_self.addItem();
						_self.resetSerialNos();
						$(_self.submit).prop('disabled', 0).removeClass('disabled');
						$(_self.row).find(':input').prop('disabled', 0).removeClass('disabled');
					}
					$(_self.row).removeClass(_self.inAction);
				}
			});

			$(this.row).find('input, textarea').keypress(function(e){
				var keyCode = (event.keyCode ? event.keyCode : event.which);   
			    if(keyCode == 13) {
			        $(_self.table).find(_self.submit).click();
			    }
			});
		},

		setJsonData: function(jsonString) {
			$(this.table).attr('data-json', jsonString)
		},

		loadData: function(removeExisting) {
			var _self 		= this;
			var jsonString  = $(this.table).attr('data-json');
			var ajaxURL 	= $(this.table).attr('data-ajax');
			if(removeExisting === undefined || removeExisting === true) {
				$(_self.tBody).find('tr:not(:last)').remove();
			}
			if(jsonString) {
				var jsonData = $.parseJSON(jsonString);
				if(jsonData && jsonData.length > 0) {
					$.each(jsonData, function(index, item){
						_self.addItem(null, item);
					});
				}
				$(this.table).attr('data-json', '');
			} else if(ajaxURL) {
				$.ajax({
		            type: 'GET',
		            url : ajaxURL,
		            beforeSend : function() {
						
					},
		            success:function(response) {
		             	if(response.data && response.data.length) {
							$.each(response.data, function(index, item){
							    _self.addItem(null, item);
							});
		             	}
		            },
		            error: function() {

		            },
		            complete : function() {

		            }
		        });
			}
			_self.resetSerialNos();
		},

		submitAction: function(ajaxURL) {
			var _self = this;
			$.ajax({
				url 		: ajaxURL,
				type 		: 'POST',
				data 		: _self.getData(this.row),
				beforeSend  : function() {
					$(_self.submit).prop('disabled', 1).addClass('disabled');
					$(_self.row).find(':input').prop('disabled', 1).addClass('disabled');
				},
				success:function(response) {
					if(response.status == 'success') {
						if(response.message) {
							AmsifyHelper.showFlash(response.message, 'success');
						}
						_self.addItem((response.id)? response.id: null);
						_self.resetSerialNos();
					} else {
						AmsifyHelper.showFlash((response.message)? response.message: 'Something went wrong', 'error');
					}
				},
				error: function() {

				},
				complete : function() {
					$(_self.submit).prop('disabled', 0).removeClass('disabled');
					$(_self.row).find(':input').prop('disabled', 0).removeClass('disabled');
				}
		    });
		},

		getData: function(selector) {
			var formData = {};
			$(selector).find(':input').each(function(){
				var name  = $(this).attr('name');
				var value = $(this).val();
				if(name && name !== undefined) {
					formData[name] = (value)? value: null;
				}
			});
			return formData;
		},

		resetData: function() {
			$(this.row).find(':input').each(function(){
				var defaultVal = $(this).attr('data-default')? $(this).attr('data-default'): '';
			    switch(this.type) {
			        case 'password':
			        case 'text':
			        case 'textarea':
			        case 'file':
			        case 'select-one':
			        case 'select-multiple':
			        case 'date':
			        case 'number':
			        case 'tel':
			        case 'email':
			            $(this).val(defaultVal);
			            break;
			        case 'checkbox':
			        case 'radio':
			            this.checked = false;
			            break;
			    }
			});
		},

		addItem: function(id, data) {
			var _self = this;
			$cloned = $(this.row).clone();
			$cloned.insertBefore(this.row);
			$cloned.removeClass(_self.inAction);
			if(data === undefined) {
				AmsifyHelper.actionBackground($cloned, 'add');
			}
			$saveBtn = $cloned.find(this.submit);
			if(this.submit.slice(0,1) == '#') {
				$saveBtn.attr('id', '');
			}
			if(!$saveBtn.attr('title')) {
				$saveBtn.attr('title', 'Save');
			}
			$saveBtn.html(this.settings.preEditText)
			        .prop('disabled', 0)
			        .removeClass('disabled')
			        .removeClass(this.editReadyClass)
			        .addClass(this.actionButton.substring(1));
			if(data) {
				$.each(data, function(name, value) {
					_self.setInputValue($cloned, name, value);
				});
			} else if(id) {
				$cloned.find('input[name="id"]').val(id);
				$(_self.row).find('select').each(function(i) {
				    $cloned.find('select').eq(i).val($(this).val());
				});
			}

			$cancelBtn = $('<button title="Cancel" style="margin-left: 7px;" type="button">'+this.settings.cancelText+'</button>').insertAfter($saveBtn);
			$cancelBtn.addClass($saveBtn.attr('class')).addClass(this.actionButton.substring(1));

			$removeBtn = $('<button title="Delete" style="margin-left: 7px;" type="button">'+this.settings.removeTxt+'</button>').insertAfter($cancelBtn);
			$removeBtn.addClass($saveBtn.attr('class')).addClass(this.actionButton.substring(1));

			$cancelBtn.hide();

			$cloned.find(':input').not(this.actionButton).prop('disabled', 1).addClass('disabled');
			this.setItemEvents($cloned, $saveBtn, $cancelBtn, $removeBtn);
			this.resetData();

			if(this.settings.afterAdd !== null && typeof this.settings.afterAdd == "function") {
                this.settings.afterAdd($cloned);
            }
		},

		setInputValue: function($selector, name, value) {
			$input = $selector.find('[name="'+name+'"]');
			if($input.attr('type') == 'radio') {
				$selector.find('input[name="'+name+'"][value="'+value+'"]').prop('checked', true);
			} else if($input.prop('tagName') && $input.prop('tagName').toLowerCase() == 'select') {
				$input.find('option[value="'+value+'"]').prop('selected', true);
				$input.attr('data-value', value);
			} else if($input.attr('type') == 'checkbox') {
				$input.prop('checked', ((value == '1')? true: false));
			} else {
				$input.val(value);
			}
		},

		setItemEvents: function($row, $saveBtn, $cancelBtn, $removeBtn) {
			var _self = this;
			$row.attr('id', '');
			$row.attr('data-ajax', '');

			$row.find(':input').keypress(function(e){
				var keyCode = (event.keyCode ? event.keyCode : event.which);   
			    if (keyCode == 13) {
			        $saveBtn.click();
			    }
			});

			$cancelBtn.click(function(){
				if(_self.settings.allowRemove) {
					$removeBtn.show();
				}
				$(this).hide();
				$saveBtn.removeClass(_self.editReadyClass).html(_self.settings.preEditText);
				$row.find(':input').not(_self.actionButton).prop('disabled', 1).addClass('disabled');
			});

			$saveBtn.click(function(){
				if($(this).hasClass(_self.editReadyClass)) {
					_self.saveAction($row, $saveBtn, $cancelBtn, $removeBtn);
				} else {
					$cancelBtn.show();
					$removeBtn.hide();
					$(this).addClass(_self.editReadyClass).html(_self.settings.updateText);
					$row.find(':input').not(_self.actionButton).prop('disabled', 0).removeClass('disabled');
				}
			});
			if(this.settings.allowRemove) {
				$removeBtn.click(function(){
					if(confirm('Are you sure you want to delete')) {
						var ajaxURL = $row.attr('data-ajax-delete');
						if(ajaxURL) {
							var deleteType = $row.attr('data-delete-type')? $row.attr('data-delete-type'): 'DELETE';
							var formData   = {};
							if(deleteType.toLowerCase() != 'get') {
								formData['_token'] = $('meta[name="_token"]').attr('content');
							}
							$idElement = $row.find('input[ajax-url-append]');
							if($idElement.length) {
								ajaxURL = ajaxURL+'/'+$idElement.val();
							}
							$.ajax({
					            type: deleteType,
					            url : ajaxURL,
					            data: formData,
					            beforeSend : function() {
					            	$row.find(':input').prop('disabled', 1).addClass('disabled');
								},
					            success:function(response) {
					             	if(response.status == 'success' || response.status === true) {
					             		if(response.message) {
											AmsifyHelper.showFlash(response.message, 'success');
										}
					        			AmsifyHelper.actionBackground($row, 'remove');
					        			setTimeout(function(){
					        				_self.resetSerialNos();
					        				if(_self.settings.afterDelete !== null && typeof _self.settings.afterDelete == "function") {
								                _self.settings.afterDelete($cloned);
								            }
					        			}, 4000);
					             	} else {
					             		if(response.message) {
											AmsifyHelper.showFlash(response.message, 'error');
										}
					             	}
					            },
					            error: function() {

					            },
					            complete : function() {
					            }
					        });
						} else {
							AmsifyHelper.actionBackground($row, 'remove');
							setTimeout(function(){
		        				_self.resetSerialNos();
		        				if(_self.settings.afterDelete !== null && typeof _self.settings.afterDelete == "function") {
					                _self.settings.afterDelete($cloned);
					            }
		        			}, 4000);
						}
					}
				});
			} else {
				$removeBtn.hide();
			}
		},

		saveAction: function($row, $saveBtn, $cancelBtn, $removeBtn) {
			var _self 	= this;
			var ajaxURL = ($row.attr('data-ajax'))? $row.attr('data-ajax'): $(_self.row).attr('data-ajax');
			if(ajaxURL) {
				$.ajax({
					url 		: ajaxURL,
					type 		: 'POST',
					data 		: _self.getData($row),
					beforeSend  : function() {
						$saveBtn.prop('disabled', 1).addClass('disabled');
						$removeBtn.prop('disabled', 1).addClass('disabled');
						$row.find(':input').prop('disabled', 1).addClass('disabled');
					},
					success:function(response) {
						if(response.status == 'success') {
							if(response.message) {
								AmsifyHelper.showFlash(response.message, 'info');
							}
							AmsifyHelper.actionBackground($row, 'update');
							$saveBtn.removeClass(_self.editReadyClass).html(_self.settings.preEditText);
							$cancelBtn.hide().prop('disabled', 0).removeClass('disabled');
							if(_self.settings.allowRemove) {
								$removeBtn.show();
							}
							_self.resetSerialNos();
						} else {
							$row.find(':input').not(_self.actionButton).prop('disabled', 0).removeClass('disabled');
							$cancelBtn.show();
							$removeBtn.hide();
						}
					},
					error: function() {

					},
					complete : function() {
						$saveBtn.prop('disabled', 0).removeClass('disabled');
						$removeBtn.prop('disabled', 0).removeClass('disabled');
					}
			    });	
			} else {
				$row.find(':input').prop('disabled', 1).addClass('disabled');
				AmsifyHelper.actionBackground($row, 'update');
				$saveBtn.removeClass(_self.editReadyClass).html(_self.settings.preEditText);
				$cancelBtn.hide().prop('disabled', 0).removeClass('disabled');
				if(_self.settings.allowRemove) {
					$removeBtn.show();
				}
				$saveBtn.prop('disabled', 0).removeClass('disabled');
				$removeBtn.prop('disabled', 0).removeClass('disabled');
			}
			
		},

		resetSerialNos: function() {
			var serial = 1;
			$(this.table).find('.serial-number').each(function(){
				$(this).text(serial);
				serial++;
			});
		}
	};

	window.FormList = FormList;

}(jQuery, window, document));
