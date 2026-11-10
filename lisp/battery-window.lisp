;;;; Battery card pilot: AGS `card/data-stream/battery-info.tsx` rendered from
;;;; SBCL with GTK4 + AstalBattery through GObject Introspection.
;;;;
;;;; Built on the introspection layer of ~/Workspace/domain-specific-language-lisp.
;;;; Run: sbcl --load lisp/battery-window.lisp
;;;; CSS: sass --no-source-map style.scss lisp/style.css

(load (merge-pathnames "quicklisp/setup.lisp" (user-homedir-pathname)))
(ql:quickload '(:cl-gobject-introspection :uiop) :silent t)
(load (or (uiop:getenv "DSL_KIT_LOAD")
          "/usr/local/lib/domain-specific-language-lisp/load.lisp"))
(use-package :dsl-kit)

(define-introspection-namespaces
  (gtk "Gtk" "4.0")
  (battery-namespace "AstalBattery" "0.1")
  (power-profiles-namespace "AstalPowerProfiles" "0.1"))

(defparameter *battery* (gir:invoke (battery-namespace 'get-default)))
(defparameter *power-profiles*
  (gir:invoke (power-profiles-namespace 'get-default)))

(defparameter *decoration-path*
  (namestring (merge-pathnames #P"../assets/decoration.svg"
                               (or *load-truename*
                                   *default-pathname-defaults*))))

(defparameter *style-path*
  (merge-pathnames "style.css"
                   (make-pathname :name nil :type nil
                                  :defaults *load-truename*)))

;;;; --- enum names ---------------------------------------------------------

(define-introspection-enum-names battery-state-name
  ("UNKNOWN" "CHARGING" "DISCHARGING" "EMPTY" "FULLY CHARGED"
   "PENDING CHARGE" "PENDING DISCHARGE"))

(define-introspection-enum-names battery-technology-name
  ("UNKNOWN" "LITHIUM ION" "LITHIUM POLYMER" "LITHIUM IRON PHOSPHATE"
   "LEAD ACID" "NICKEL CADMIUM" "NICKEL METAL HYDRIDE" "NICKEL ZINC"
   "SILVER ZINC" "LITHIUM SOLID POLYMER"))

(define-introspection-enum-names battery-warning-name
  ("UNKNOWN" "NONE" "DISCHARGING" "LOW" "CRITICAL" "ACTION"))

;;;; --- shared state -------------------------------------------------------

(define-introspection-value-label-table
    *value-labels*
  "The card's entry name to value label index.")

(defparameter *full-report-label* nil
  "The label showing the full `upower -i` report, for refresh.")

(defun battery-field (property-name &optional (default-value "-"))
  (read-introspection-property *battery* property-name default-value))

(defun percentage-text ()
  (if (battery-field 'is-present nil)
      (format nil "~d%" (round (* 100 (battery-field 'percentage 0))))
      "N/A"))

(defun state-text ()
  (if (battery-field 'is-present nil)
      (battery-state-name (battery-field 'state 0))
      "N/A"))

(defun seconds-as-hours-and-minutes (seconds)
  (if (or (null seconds) (not (numberp seconds)) (<= seconds 0))
      "-"
      (format nil "~dh ~dmin" (floor seconds 3600) (floor (mod seconds 3600) 60))))

(defun energy-text (property-name)
  (format nil "~,2f Wh" (or (battery-field property-name 0) 0)))

(defun upower-report ()
  "The full `upower -i` report for the battery device, uppercased."
  (handler-case
      (string-right-trim
       "
"
       (uiop:run-program
        "upower -i $(upower -e | grep BAT) 2>/dev/null | tr '[:lower:]' '[:upper:]'"
        :output :string))
    (error () "-")))

;;;; --- data columns -------------------------------------------------------

(defun upower-field (grep-pattern column)
  "One field from `upower -i`, uppercased and trimmed like the AGS card."
  (handler-case
      (string-upcase
       (string-trim " "
                    (string-right-trim
                     "
"
                     (uiop:run-program
                      (format nil "upower -i $(upower -e | grep BAT) | grep '~a' | cut -d: -f~d | sed 's/^ *//'"
                              grep-pattern column)
                      :output :string))))
    (error () "-")))

(defun field-pairs ()
  `(("NATIVE PATH" . ,(upower-field "native-path" 2))
    ("HAS HISTORY" . ,(upower-field "has history" 2))
    ("STATE" . ,(upower-field "state" 2))
    ("ENERGY-FULL" . ,(upower-field "energy-full:" 2))
    ("TIME-TO-EMPTY" . ,(upower-field "time to empty:" 2))
    ("ACTIVE PROFILE" . ,(string-upcase
                          (or (read-introspection-property
                               *power-profiles* 'active-profile "")
                              "-")))))

(defun field-pairs-2 ()
  `(("VENDOR" . ,(upower-field "vendor" 2))
    ("HAS STATISTICS" . ,(upower-field "has statistics" 2))
    ("WARNING LEVEL" . ,(upower-field "warning-level" 2))
    ("ENERGY-FULL-DESIGN" . ,(upower-field "energy-full-design:" 2))
    ("PERCENTAGE" . ,(upower-field "percentage:" 2))
    ("PERFORMANCE DEGRADED" . ,(if (battery-field 'performance-degraded
                                                  (read-introspection-property
                                                   *power-profiles*
                                                   'performance-degraded nil))
                                   "YES" "NO"))))

(defun field-pairs-3 ()
  `(("POWER SUPPLY" . ,(upower-field "power supply" 2))
    ("PRESENT" . ,(upower-field "present" 2))
    ("ENERGY" . ,(upower-field "energy:" 2))
    ("ENERGY-RATE" . ,(upower-field "energy-rate:" 2))
    ("CAPACITY" . ,(upower-field "capacity:" 2))
    ("POWERPROFILE VERSION" . ,(string-upcase
                                (or (read-introspection-property
                                     *power-profiles* 'version "")
                                    "-")))))

(defun field-pairs-4 ()
  `(("UPDATED" . ,(upower-field "updated" 2))
    ("RECHARGEABLE" . ,(upower-field "rechargeable" 2))
    ("ENERGY-EMPTY" . ,(upower-field "energy-empty:" 2))
    ("VOLTAGE" . ,(upower-field "voltage:" 2))
    ("TECHNOLOGY" . ,(upower-field "technology:" 2))
    ("BATTERY AWARE" . ,(handler-case
                            (string-upcase
                             (string-trim " "
                                          (string-right-trim
                                           "
"
                                           (uiop:run-program
                                            "powerprofilesctl query-battery-aware | cut -d: -f2 | tr -d ' '"
                                            :output :string))))
                          (error () "-")))))

;;;; --- widgets ------------------------------------------------------------

(defun make-entry (parent entry-name entry-value)
  "NAME: over VALUE, the shape of helper/create-entry-content.tsx."
  (let ((row (with-introspection-box (row parent gtk) :vertical :spacing 1)))
    (let ((name-row (with-introspection-box (name-row row gtk)
                      :horizontal :spacing 2)))
      (set-introspection-property name-row 'halign (gir:nget gtk "Align" :start))
      (append-introspection-children
       name-row
       (with-introspection-label (name-label gtk (format nil "~a:" entry-name))
         :halign :start
         :css-classes '("alt-start-animation"))))
    (let ((value-row (with-introspection-box (value-row row gtk)
                       :horizontal :spacing 4)))
      (set-introspection-property value-row 'halign (gir:nget gtk "Align" :start))
      (let ((value-label (with-introspection-label (value-label gtk
                                                      (or entry-value ""))
                           :halign :start
                           :css-classes '("value" "start-animation"))))
        (set-introspection-property value-label 'hexpand t)
        (setf (gethash entry-name *value-labels*) value-label)
        (append-introspection-children value-row value-label)))
    row))

(defun make-entry-column (parent pair-list)
  (let ((column (with-introspection-box (column parent gtk)
                  :vertical :spacing 8 :css-class "entry")))
    (set-introspection-property column 'hexpand t)
    (set-introspection-property column 'halign (gir:nget gtk "Align" :fill))
    (dolist (pair pair-list)
      (make-entry column (car pair) (cdr pair)))
    column))

(defun make-panel (parent)
  "The header row: indicator dot, decoration image, name. Like create-panel.tsx."
  (let ((panel (with-introspection-box (panel parent gtk)
                 :horizontal :css-class "panel")))
    (let ((indicator (with-introspection-box (indicator panel gtk) :horizontal)))
      (set-introspection-property indicator 'width-request 5)
      (gir:invoke (indicator 'add-css-class) "panel-active"))
    (let ((overlay (with-introspection-box (overlay panel gtk) :horizontal)))
      (let ((content (with-introspection-box (content overlay gtk)
                       :horizontal :spacing 5 :css-class "content")))
        (append-introspection-children
         content
         (make-introspection-image gtk *decoration-path* :pixel-size 16)
         (with-introspection-label (title gtk "BATTERY") :halign :start))
        (let ((spacer (with-introspection-box (spacer content gtk) :horizontal)))
          (set-introspection-property spacer 'hexpand t))))
    panel))

(defun make-card (window)
  (let ((card (with-introspection-box (card window gtk)
                :vertical :css-class "card" :attach :set-child)))
    (with-introspection-properties
        (card :margin-start 12 :margin-end 12
              :margin-top 12 :margin-bottom 12)
      (make-panel card)
      (let ((card-content (with-introspection-box (card-content card gtk)
                            :vertical :css-class "card-content")))
        (let ((content-outer (with-introspection-box (content-outer card-content gtk)
                               :horizontal :css-class "content")))
          (set-introspection-property content-outer 'hexpand t)
          (set-introspection-property content-outer 'halign (gir:nget gtk "Align" :fill))
          (let ((columns (with-introspection-box (columns content-outer gtk)
                           :horizontal)))
            (set-introspection-property columns 'hexpand t)
            (set-introspection-property columns 'halign (gir:nget gtk "Align" :fill))
            (make-entry-column columns (field-pairs))
            (make-entry-column columns (field-pairs-2))
            (make-entry-column columns (field-pairs-3))
            (make-entry-column columns (field-pairs-4))))
        (let ((extended (with-introspection-box (extended card-content gtk)
                          :horizontal :css-class "extended-content")))
          (let ((scrolled (make-introspection-scrolled-window gtk
                              :min-width 100 :min-height 55)))
            (set-introspection-property scrolled 'hexpand t)
            (append-introspection-children extended scrolled)
            (let ((report-box (with-introspection-box (report-box scrolled gtk)
                                :horizontal :spacing 20 :attach :set-child)))
              (set-introspection-property report-box 'valign
                                          (gir:nget gtk "Align" :start))
              (let ((report (with-introspection-label (report gtk (upower-report))
                              :halign :start)))
                (set-introspection-property report 'valign
                                            (gir:nget gtk "Align" :start))
                (setf *full-report-label* report)
                (append-introspection-children report-box report)))))))
    card))

;;;; --- live updates -------------------------------------------------------

(defun refresh-labels (&rest arguments)
  "Recompute every value that can change while the card is open."
  (declare (ignore arguments))
  (dolist (pair `(("PERCENTAGE" . ,(percentage-text))
                  ("STATE" . ,(state-text))
                  ("ENERGY" . ,(energy-text 'energy))
                  ("ENERGY-RATE" . ,(format nil "~,2f W"
                                            (or (battery-field 'energy-rate 0) 0)))
                  ("TIME-TO-EMPTY" . ,(seconds-as-hours-and-minutes
                                       (battery-field 'time-to-empty 0)))
                  ("PRESENT" . ,(if (battery-field 'is-present nil) "YES" "NO"))))
    (refresh-introspection-value-label *value-labels* (car pair) (cdr pair)))
  (when *full-report-label*
    (set-introspection-property *full-report-label* 'label (upower-report))))

;;;; --- application --------------------------------------------------------

(define-introspection-application
    (main gtk "org.example.battery-card"
     :title "Battery card — SBCL + libastal"
     :width 900 :height 220
     :css-file *style-path*)
    (application window)
  (load-introspection-css-data ((gir:invoke (window 'get-display))
                                ".panel-active { min-width: 5px; background-color: #3353F3; }"
                                gtk))
  (connect-introspection-property-notifications *battery* #'refresh-labels
    :percentage :state :is-present)
  (connect-introspection-property-notifications *power-profiles* #'refresh-labels
    :active-profile)
  (make-card window))

(main)
