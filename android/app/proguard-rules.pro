# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Keep WebView related classes
-keepclassmembers class * extends android.webkit.WebView {
    public *;
}

# Keep JavaScript interface methods
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep custom views
-keep public class * extends android.view.View {
    public <init>(android.content.Context);
    public <init>(android.content.Context, android.util.AttributeSet);
    public <init>(android.content.Context, android.util.AttributeSet, int);
}

# Keep custom application class
-keep public class * extends android.app.Application

# Keep custom activity classes
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Fragment
-keep public class * extends android.support.v4.app.Fragment
-keep public class * extends androidx.fragment.app.Fragment

# Keep custom service classes
-keep public class * extends android.app.Service

# Keep custom broadcast receiver classes
-keep public class * extends android.content.BroadcastReceiver

# Keep custom content provider classes
-keep public class * extends android.content.ContentProvider

# Keep custom view classes
-keep public class * extends android.view.View
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Application
-keep public class * extends android.app.Service
-keep public class * extends android.content.BroadcastReceiver
-keep public class * extends android.content.ContentProvider
-keep public class * extends android.preference.Preference
-keep public class * extends android.view.ViewGroup
-keep public class * extends android.widget.BaseAdapter
-keep public class * extends android.widget.AdapterView
-keep public class * extends android.widget.CompoundButton
-keep public class * extends android.widget.TextView
-keep public class * extends android.widget.ImageView
-keep public class * extends android.widget.ListView
-keep public class * extends android.widget.GridView
-keep public class * extends android.widget.Spinner
-keep public class * extends android.widget.Button
-keep public class * extends android.widget.EditText
-keep public class * extends android.widget.CheckBox
-keep public class * extends android.widget.RadioButton
-keep public class * extends android.widget.RadioGroup
-keep public class * extends android.widget.Switch
-keep public class * extends android.widget.ToggleButton
-keep public class * extends android.widget.SeekBar
-keep public class * extends android.widget.ProgressBar
-keep public class * extends android.widget.RatingBar
-keep public class * extends android.widget.ScrollView
-keep public class * extends android.widget.HorizontalScrollView
-keep public class * extends android.widget.TabHost
-keep public class * extends android.widget.TabWidget
-keep public class * extends android.widget.TabLayout
-keep public class * extends android.widget.Toolbar
-keep public class * extends android.widget.CardView
-keep public class * extends android.widget.RecyclerView
-keep public class * extends android.widget.ViewFlipper
-keep public class * extends android.widget.ViewSwitcher
-keep public class * extends android.widget.ViewAnimator
-keep public class * extends android.widget.AdapterViewFlipper
-keep public class * extends android.widget.StackView
-keep public class * extends android.widget.ExpandableListView
-keep public class * extends android.widget.MultiAutoCompleteTextView
-keep public class * extends android.widget.AutoCompleteTextView
-keep public class * extends android.widget.CheckedTextView
-keep public class * extends android.widget.TextSwitcher
-keep public class * extends android.widget.ImageSwitcher
-keep public class * extends android.widget.Gallery
-keep public class * extends android.widget.GridLayout
-keep public class * extends android.widget.TableLayout
-keep public class * extends android.widget.TableRow
-keep public class * extends android.widget.LinearLayout
-keep public class * extends android.widget.RelativeLayout
-keep public class * extends android.widget.FrameLayout
-keep public class * extends android.widget.AbsoluteLayout
-keep public class * extends android.widget.ScrollView
-keep public class * extends android.widget.HorizontalScrollView
-keep public class * extends android.widget.ViewFlipper
-keep public class * extends android.widget.ViewSwitcher
-keep public class * extends android.widget.ViewAnimator
-keep public class * extends android.widget.AdapterViewFlipper
-keep public class * extends android.widget.StackView
-keep public class * extends android.widget.ExpandableListView
-keep public class * extends android.widget.MultiAutoCompleteTextView
-keep public class * extends android.widget.AutoCompleteTextView
-keep public class * extends android.widget.CheckedTextView
-keep public class * extends android.widget.TextSwitcher
-keep public class * extends android.widget.ImageSwitcher
-keep public class * extends android.widget.Gallery
-keep public class * extends android.widget.GridLayout
-keep public class * extends android.widget.TableLayout
-keep public class * extends android.widget.TableRow
-keep public class * extends android.widget.LinearLayout
-keep public class * extends android.widget.RelativeLayout
-keep public class * extends android.widget.FrameLayout
-keep public class * extends android.widget.AbsoluteLayout 