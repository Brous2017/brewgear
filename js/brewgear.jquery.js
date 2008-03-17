/**
 * Extend JQuery with some custom methods.
 */

//(function($) {
  $.extend({
    escape: function(txt) {
      return txt.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;');
    },
    update_queue: [],
    _change_count: 0,
    
    block: function(callback) {
      var blocker = $('#_jq_blocker');
      if (!blocker.length) {
        $('body').append('<div id="_jq_blocker" />');
        blocker = $('#_jq_blocker');
        blocker.css({
          position: 'fixed',
          'background-color': 'black',
          opacity: 0.1,
          left: 0,
          top: 0, bottom: 0, right: 0,
          //width: $('body').innerWidth() + 'px',
          height: $('body').innerHeight() + 'px',
          'z-index': 999,
          cursor: 'wait'
        });
      }
      blocker.css('display', 'block');
      //blocker.fadeTo('slow', 0.6, callback);
      if (callback) { callback(); }
    },
    unblock: function(callback) {
      var blocker = $('#_jq_blocker');
      //blocker.fadeOut("slow", callback);
      blocker.css('display', 'none');
      if (callback) { callback(); }
    }
  });
  
  $.fn.extend({

    /**
     * Simple way to enable/disable input fields.
     */
    disable: function() {
      $(this).attr('disabled', 'disabled');
    },

    enable: function() {
      $(this).removeAttr('disabled');
    },

    showDialog: function() {
      var d = $(this);
      $.block(function() {
        d.css('left', (window.innerWidth - d.outerWidth()) / 2 + 'px');
        $(d).slideDown();
      });
    },
    
    hideDialog: function() {
      $(this).slideUp(function() {
        $.unblock();
      });
    },
    
    /**
     * Returns the sum of a set of (input) fields. The value of a field is
     * determined by val(). Only finite values are added.
     */
    sum: function() {
      var total = 0;
      $(this).each(function() {
        var f = parseFloat($(this).val());
        if (isFinite(f)) { total += f }
      });
      return total;
    },

    /**
     * Override the change event.
     * The handler is wrapped, so it knows how to deal with queued updates.
     */
    change: function(handler) {
      return handler ? this.bind("change", function() {
        //console.log('Toplevel change is', this, e, toplevel, $.update_queue.length);
        $._change_count++;
        try {
          $(this).each(handler);
        } finally {
          --$._change_count;
        }
        if($._change_count === 0) {
          var q = $.unique($.update_queue.reverse());
          //console.log('Had', $.update_queue.length, 'items. Now only have to update', q.length);
          try {
            q.reverse();
            for (i in q) {
              $(q[i]).update();
            }
          } finally {
            $.update_queue = [];
          }
        }
      }) : this.trigger("change");
    },

    /**
     * In case of a change() event (invoked by the user) and update() + change()
     * is invoked for the element.
     */
    observe: function(observed, lock) {
      var e = $(this);
      $(observed).change(function() {
        //console.log('updating', e, 'from', this);
        e.queue_for_update();
        e.change();
      });
      return this;
    },

    queue_for_update: function() {
      //$(this).update();
      //console.log('Pushing', this, 'on the queue');
      $.update_queue.push(this);
      return this;
    },
    
    /**
     * This (custom) trigger is used to update specific fields. The data used
     * may be obtained from other fields on the page.
     *
     * If 'observed' is provided, the update() function should only be performed if
     * one of the observed elements is causing the update signal.
     */
    update: function(handler) {
      return handler ? this.bind("update", handler) : this.trigger("update");
    },

    /**
     * Field() parses the input field value, to float or integer if the "real"
     * or "number" class is assigned to the input.
     */
    field: function() {
      var e = $(this);
      var c = e.attr('class');
      try {
        if (c.match(/\breal\b/)) {
          return parseFloat(e.val());
        } else if (c.match(/\bnumber\b/)) {
          return parseInt(e.val(), 10);
        } else if (c.match(/\bdate\b/)) {
          var parts = e.val().split(/[^\d]/);
          var y = parseInt(parts[2], 10), m = parseInt(parts[1], 10), d = parseInt(parts[0], 10);
          if (y < 100) { y += 2000; }
          return new Date(y, m-1, d);
        }
      } catch(exc) { }
      return e.val();
    },

    multistate: function(state) {
      if (state) {
        var items = $(this).attr('rel').split(/,/);
        for (i in items) {
          var kv = items[i].split(/:/);
          if (kv[0] == state) {
            $(this).val(kv[0]).text(kv[1]);
            break;
          }
        }
        return this;
      }
      
      $(this).each(function() {
        var e = $(this);
        var map = {};
        var items = e.attr('rel').split(/,/);
        var last = '_default_';
        for (i in items) {
          var kv = items[i].split(/:/);
          map[last] = kv;
          last = kv[0];
        }
        // make the reference cyclic:
        map[last] = map._default_;

        var val = e.val();
        if (!val || val == map._default_[0]) {
          e.val(map._default_[0]).text(map._default_[1]);
        }
        e.click(function() {
          var kv = map[e.val() || '_default_'];
          e.val(kv[0]).text(kv[1]).change();
        });
      });
      return this;
    }
    
  });
  
//})(jQuery);
// vim: sw=2:et:ai